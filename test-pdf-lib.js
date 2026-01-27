const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

(async () => {
    const pdfBytes = fs.readFileSync('Nuvva2025 - 2.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Create extracted directory
    if (!fs.existsSync('extracted_raw')) {
        fs.mkdirSync('extracted_raw');
    }

    console.log(`Found ${pages.length} pages.`);

    let imageCount = 0;

    // We can't easily iterate "images" directly in pdf-lib usually without inspecting operators,
    // but verifying if there's a simpler API or if I need to use generic objects.
    // pdf-lib high-level API doesn't have "getImages()" directly on page.
    // We might need to look at xObjects.

    // Using a different approach for pdf-lib image extraction:
    // It's often complex.

    // Alternative: verify if pdf-parse allows image access? No.
    // Check if 'mammoth' or others help? No.

})();
