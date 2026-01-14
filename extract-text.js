const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

async function extractText() {
    const pdfPath = path.join(__dirname, 'Nuvva2025.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);

    try {
        // pdf-parse might be the function itself or have a default property
        const pdf = pdfParse.default || pdfParse;

        const data = await pdf(dataBuffer);
        console.log(data.text);
    } catch (error) {
        console.error('Error extracting text:', error);
    }
}

extractText();
