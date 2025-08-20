📄 DOCX to PDF Converter

A simple web-based file converter that allows users to upload a `.docx` file from the frontend, sends it to a Node.js + Express backend, and receives the converted `.pdf` file for download.

Features
- Upload `.docx` file via a modern styled UI (`index.html`).
- Backend processes the file using Node.js + Express + `mammoth`/`pdfkit`.
- Returns the converted `.pdf` file for direct download.
- Error handling for invalid file types and missing uploads.
- Ready to deploy on Render or any Node.js hosting service.

Project Flow
1. User selects a `.docx` file on the frontend.
2. Frontend (`index.html`) sends the file via `fetch()` to backend (`server.js`).
3. Backend receives file using `multer` (for file upload).
4. File content is extracted → converted to PDF.
5. Converted `.pdf` file is sent back as a download response.

