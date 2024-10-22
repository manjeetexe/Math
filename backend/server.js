const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;


app.get('/', (req, res) =>{
    res.send('hello every one')
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});