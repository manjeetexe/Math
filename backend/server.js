const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Replace with your API key (or ensure process.env.APIKEY is correctly set)
const genAI = new GoogleGenerativeAI("AIzaSyC083OaLe0DQtpRhpLdWB5ojhNkm5XwHV8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
app.use(cors()); // Enable CORS for all requests

app.use(express.json({ limit: '10mb' }));

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir); 
}

app.post('/save-image', (req, res) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(imagesDir, `canvas_image_${Date.now()}.png`);
    const prompt = "what is the answer? ";
    const img = base64Data;  // Corrected to use actual base64 string

    const imageSend = {
        inlineData: {
          data: img,  // Use the base64 string directly
          mimeType: "image/png",  // Correct MIME type for the image
        },
    };
      
    (async () => {
        try {
          // Generate content using the prompt and image
          const result = await model.generateContent([prompt, imageSend]);
          
          // Output the AI's response to the console
          console.log(result.response.text());
        } catch (error) {
          console.error("Error generating content:", error);
        }
    })();

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ message: 'Failed to save image' });
        }
        
        res.status(200).json({ message: 'Image saved successfully', filePath });
    });
});

app.listen(8000, () => {
    console.log('Server running on port 8000');
});