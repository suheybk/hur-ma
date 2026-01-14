const fs = require('fs');
const path = require('path');
// Try to require pdf-parse
const pdfLib = require('pdf-parse');

async function extractText() {
    const pdfPath = path.join(__dirname, 'Nuvva2025.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);

    try {
        // Based on debug output, if pdfLib is an object and not a function, 
        // we need to find the entry point. 
        // Sometimes it might require default, or maybe it IS the library but acts differently.
        // Let's try to inspect what pdfLib calls if we can, or just try to usage.

        let pdf = pdfLib;
        // If it has a default property that is a function, use it.
        if (typeof pdfLib.default === 'function') {
            pdf = pdfLib.default;
        }

        // If we still can't call it, and it has PDFParse, maybe that's it?
        // But usually pdf-parse is the main function.

        console.log('Attempting to parse PDF...');
        // In some contexts, require('pdf-parse') returns the module object.
        // If usage is pdf(buffer), and pdfLib is an object...

        if (typeof pdf === 'function') {
            const data = await pdf(dataBuffer);
            console.log('--- START PDF TEXT ---');
            console.log(data.text);
            console.log('--- END PDF TEXT ---');
        } else {
            console.error('pdf-parse import is not a function. Keys:', Object.keys(pdfLib));
            // Fallback: maybe we can use a different library if this persists?
            // Or specific known key?
        }

    } catch (error) {
        console.error('Error extracting text:', error);
    }
}

extractText();
