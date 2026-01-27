const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const path = require('path');

const options = {}; /* see below */
const pdfPath = path.join(__dirname, 'Nuvva2025 - 2.pdf');

console.log('Extracting text from:', pdfPath);

pdfExtract.extract(pdfPath, options, (err, data) => {
    if (err) return console.log(err);

    // Combine text from pages
    let fullText = '';
    data.pages.forEach(page => {
        page.content.forEach(content => {
            fullText += content.str + '\n';
        });
    });

    // Write to file
    const fs = require('fs');
    fs.writeFileSync('extracted_text.txt', fullText);
    console.log('Text written to extracted_text.txt');

});
