const express = require("express");
const bodyparser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const libre = require('libreoffice-convert');

const app = express();

// Middleware
app.use(express.static('uploads')); 
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Multer storage configuration
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

let upload = multer({ storage: storage });

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// DOCX → PDF conversion route
app.post('/docxtopdf', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const outputFileName = Date.now() + "_output.pdf";
    const outputPath = path.join("uploads", outputFileName);

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
const PORT = process.env.PORT || 3000;  // use Render’s PORT, fallback 3000 for local dev
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
