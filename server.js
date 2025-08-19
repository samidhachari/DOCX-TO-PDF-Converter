
const express = require("express");
const bodyparser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const libre = require('libreoffice-convert');

const app = express();

// ✅ Ensure uploads folder exists (important for Render)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Middleware
app.use(express.static('uploads')); 
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Multer storage configuration
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // save files in uploads/
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    },
});

let upload = multer({ storage: storage });

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// DOCX → PDF conversion route
app.post('/docxtopdf', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const outputFileName = Date.now() + "_output.pdf";
    const outputPath = path.join(uploadDir, outputFileName);

    const fileBuffer = fs.readFileSync(filePath);

    libre.convert(fileBuffer, '.pdf', undefined, (err, done) => {
        if (err) {
            console.log(`Conversion error: ${err}`);
            return res.status(500).send("Error converting file");
        }

        fs.writeFileSync(outputPath, done);

        // Send PDF file to frontend (for preview in iframe)
        res.sendFile(outputPath, { root: __dirname }, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error sending file");
            }

            // Cleanup temporary files
            fs.unlinkSync(filePath);
            fs.unlinkSync(outputPath);
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;  // Render’s PORT or local fallback
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
