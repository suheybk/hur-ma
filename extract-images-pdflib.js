const { PDFDocument, PDFName, PDFRawStream, PDFImage } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

(async () => {
    const pdfPath = 'Nuvva2025 - 2.pdf';
    console.log(`Loading ${pdfPath}...`);

    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Create output folder
    const outDir = 'extracted_raw';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const pages = pdfDoc.getPages();
    console.log(`Found ${pages.length} pages.`);

    let imgCount = 0;

    // Iterate through pages
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        console.log(`Scanning Page ${i + 1}...`);

        // Get the Resources dictionary of the page
        const { Resources } = page.node.normalizedEntries();
        if (!Resources) continue;

        const resourcesDict = Resources; // It's a Map if normalized? No, usually PDFDict
        // pdf-lib's internal structure can be tricky.

        // Let's try to access XObject
        const xObject = resourcesDict.get(PDFName.of('XObject'));
        if (!xObject) continue;

        // xObject is a PDFDict mapping names to streams (images/forms)
        const xObjectMap = pdfDoc.context.lookup(xObject);
        if (!xObjectMap) continue;

        // Iterate keys in XObject dictionary
        for (const key of xObjectMap.dict.keys()) {
            const ref = xObjectMap.dict.get(key);
            const obj = pdfDoc.context.lookup(ref);

            if (!obj) continue;

            // Check if it is an image
            if (obj.constructor.name === 'PDFRawStream' || obj.constructor.name === 'PDFStream') {
                const dict = obj.dict;
                const subtype = dict.get(PDFName.of('Subtype'));
                if (subtype === PDFName.of('Image')) {
                    // Found an image!
                    imgCount++;
                    console.log(`  Found Image ${imgCount} (Key: ${key.toString()})`);

                    // Determine extension (simplified)
                    const filter = dict.get(PDFName.of('Filter'));
                    let ext = 'bin';
                    if (filter === PDFName.of('DCTDecode')) ext = 'jpg';
                    else if (filter === PDFName.of('FlateDecode')) ext = 'png';
                    else if (filter === PDFName.of('JPXDecode')) ext = 'jp2';

                    // Extract data
                    const data = obj.contents; // This is the raw buffer

                    const filename = `page_${i + 1}_img_${imgCount}.${ext}`;
                    fs.writeFileSync(path.join(outDir, filename), data);
                    console.log(`    Saved to ${filename}`);
                }
            }
        }
    }

    console.log(`Done. Extracted ${imgCount} images.`);
})();
