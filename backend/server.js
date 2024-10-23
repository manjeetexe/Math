const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyC083OaLe0DQtpRhpLdWB5ojhNkm5XwHV8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

app.post('/save-image', (req, res) => {
    const { image, dict_of_vars_str } = req.body;  // Accept dictionary of variables from the request
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(imagesDir, `canvas_image_${Date.now()}.png`);

    // Comprehensive prompt for analyzing mathematical and graphical problems
    const prompt = `You have been provided with an image that contains mathematical expressions, equations, or graphical problems. Your task is to analyze the image and solve the problems as specified below.

    **Instructions:**
    1. **Mathematical Expressions**: 
       - Use the PEMDAS rule for solving expressions. PEMDAS stands for: 
         - **P**arentheses, 
         - **E**xponents, 
         - **M**ultiplication and **D**ivision (from left to right), 
         - **A**ddition and **S**ubtraction (from left to right).
       - **Example**: For the expression \`2 + 3 * 4\`, evaluate as follows:
         - \`3 * 4\` = 12, 
         - \`2 + 12\` = 14.
    
    2. **Types of Problems**:
       - **Simple Expressions**: Identify and solve expressions like \`2 + 2\`, \`3 * 4\`, etc. Return results in the format: 
         - \`[{ "expr": "expression", "result": value }]\`.
       - **Equations**: For equations like \`x^2 + 2x + 1 = 0\`, solve for variables and return as a comma-separated list of dictionaries:
         - \`[{ "expr": "x", "result": value, "assign": true }]\`.
       - **Assignments**: For assignments like \`x = 4\`, return a list indicating assigned values:
         - \`[{ "expr": "x", "result": 4, "assign": true }]\`.
       - **Graphical Problems**: Analyze word problems depicted graphically, providing answers in the same format as for simple expressions.
       - **Abstract Concepts**: Identify and explain abstract concepts shown in the drawing (e.g., love, conflict) and return:
         - \`[{ "expr": "explanation", "result": "abstract concept" }]\`.

    3. **Analysis**: Carefully analyze the expressions, equations, or graphical problems presented in the image. Return your answers according to the above formats.

    4. **Variable Context**: If any variables are present, refer to the following dictionary of user-assigned variables and use their actual values when solving the expressions:
       - ${dict_of_vars_str}

    **Final Output**: Ensure all keys and values are properly quoted for easier parsing with Python's ast.literal_eval. Avoid using backticks or markdown formatting in your output.
    `;

    const img = base64Data;

    const imageSend = {
        inlineData: {
            data: img,
            mimeType: "image/png",
        },
    };

    (async () => {
        try {
            // Generate content using the comprehensive prompt and image data
            const result = await model.generateContent([prompt, imageSend]);

            // Log the raw response for debugging
            let aiResponse = result.response.text();
            console.log("Raw AI response:", aiResponse);

            // Clean up the AI response
            aiResponse = aiResponse
                .replace(/```json/g, '')    // Remove any markdown-like formatting
                .replace(/```/g, '')        // Remove trailing backticks
                .replace(/`/g, '')          // Remove backticks that might interfere
                .trim();                    // Trim any extra whitespace

            console.log("Cleaned AI response:", aiResponse);

            // Try parsing the cleaned response
            let parsedResponse;
            try {
                parsedResponse = JSON.parse(aiResponse);
            } catch (jsonError) {
                console.error("Error parsing JSON:", jsonError);
                return res.status(500).json({ message: 'Invalid response format from AI', error: jsonError.message });
            }

            // Extract and send the first result back to the frontend
            if (parsedResponse && Array.isArray(parsedResponse) && parsedResponse.length > 0) {
                res.status(200).json(parsedResponse[0]);
            } else {
                res.status(500).json({ message: 'No valid response generated' });
            }

        } catch (error) {
            console.error("Error generating content:", error);
            res.status(500).json({ message: 'Failed to generate content', error: error.message });
        }
    })();

    // Save the image locally
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ message: 'Failed to save image' });
        }
    });
});

app.listen(8000, () => {
    console.log('Server running on port 8000');
});