
// const express = require("express");
// const bodyparser = require('body-parser');
// const path = require('path');
// const multer = require('multer');
// const fs = require('fs');
// const libre = require('libreoffice-convert');

// const app = express();

// Ensure uploads folder exists (important for Render)
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }

// // Middleware
// app.use(express.static('uploads')); 
// app.use(bodyparser.urlencoded({ extended: false }));
// app.use(bodyparser.json());

// // Multer storage configuration
// let storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir); // save files in uploads/
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // unique filename
//     },
// });

// let upload = multer({ storage: storage });

// // Serve frontend
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, "index.html"));
// });

// // DOCX → PDF conversion route
// app.post('/docxtopdf', upload.single('file'), (req, res) => {
//     const filePath = req.file.path;
//     const outputFileName = Date.now() + "_output.pdf";
//     const outputPath = path.join(uploadDir, outputFileName);

//     const fileBuffer = fs.readFileSync(filePath);

//     libre.convert(fileBuffer, '.pdf', undefined, (err, done) => {
//         if (err) {
//             console.log(`Conversion error: ${err}`);
//             return res.status(500).send("Error converting file");
//         }

//         fs.writeFileSync(outputPath, done);

//         // Send PDF file to frontend (for preview in iframe)
//         res.sendFile(outputPath, { root: __dirname }, (err) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send("Error sending file");
//             }

//             // Cleanup temporary files
//             fs.unlinkSync(filePath);
//             fs.unlinkSync(outputPath);
//         });
//     });
// });

// // Start server
// const PORT = process.env.PORT || 3000;  // Render’s PORT or local fallback
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });



const express = require("express");
const bodyparser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios'); // HTTP requests
const FormData = require('form-data');

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

// DOCX → PDF conversion using Nutrient API
app.post('/docxtopdf', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;

        // Prepare form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('instructions', JSON.stringify({ parts: [{ file: 'file' }] }));

        // Call Nutrient API
        const response = await axios.post(
            'https://api.nutrient.io/build',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': 'Bearer pdf_live_O5r6IKTyL8aQBxYBhIcELlWH5ErbiRAzjyxuxmm2Jzp'
                },
                responseType: 'stream'
            }
        );

        const outputFileName = Date.now() + "_output.pdf";
        const outputPath = path.join("uploads", outputFileName);

        // Save PDF stream
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        writer.on('finish', () => {
            res.sendFile(outputPath, { root: __dirname }, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send("Error sending PDF");
                }
                fs.unlinkSync(filePath);
                fs.unlinkSync(outputPath);
            });
        });
        writer.on('error', (err) => {
            console.error(err);
            res.status(500).send("Error writing PDF");
        });

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).send("Error converting file via Nutrient API");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

