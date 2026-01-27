const pdfParse = require('pdf-parse');
console.log('Type of pdfParse:', typeof pdfParse);
console.log('Exports:', Object.keys(pdfParse));

try {
    const fs = require('fs');
    const path = require('path');
    const buffer = fs.readFileSync(path.join(__dirname, 'Nuvva2025.pdf'));

    if (typeof pdfParse === 'function') {
        pdfParse(buffer).then(data => console.log('Text length:', data.text.length));
    } else if (typeof pdfParse.default === 'function') {
        pdfParse.default(buffer).then(data => console.log('Text length:', data.text.length));
    }
} catch (e) {
    console.log('Error:', e);
}
