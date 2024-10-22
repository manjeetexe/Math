const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();
app.use(cors()); // Enable CORS for all requests

app.use(express.json({ limit: '10mb' }));

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir); // Create the folder if it doesn't exist
}

app.post('/save-image', (req, res) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(imagesDir, `canvas_image_${Date.now()}.png`);

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