const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const path = require('path');

const options = {};
const pdfPath = path.join(__dirname, 'Nuvva2025 - 2.pdf');

console.log('Extracting text from:', pdfPath);

pdfExtract.extract(pdfPath, options, (err, data) => {
    if (err) return console.log(err);

    let fullText = '';
    data.pages.forEach(page => {
        page.content.forEach(content => {
            fullText += content.str + '\n';
        });
    });

    console.log('--- START EXTRACTED TEXT ---');
    console.log(fullText);
    console.log('--- END EXTRACTED TEXT ---');
});
