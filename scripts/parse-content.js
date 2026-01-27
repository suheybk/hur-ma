
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // We need cheerio to parse HTML given by mammoth

// Ensure we have the file
const docxPath = path.join(__dirname, '..', 'hurma.docx');
if (!fs.existsSync(docxPath)) {
    console.error('Error: hurma.docx not found at', docxPath);
    process.exit(1);
}

// Helper to clean text
const clean = (str) => str?.replace(/\s+/g, ' ').trim() || '';

// Parse logic
async function parseContent() {
    console.log('Reading DOCX...');
    const result = await mammoth.convertToHtml({ path: docxPath });
    const html = result.value;

    // Save HTML for debug
    fs.writeFileSync(path.join(__dirname, 'debug-content.html'), html);
    console.log('Saved debug-content.html');

    // Load into cheerio
    // Note: mammoth produces clean HTML, usually paragraphs <p> and lists <ul>/<li>
    // We need to infer structure. A common pattern in bad docs is:
    // <p>Product Name</p>
    // <p>Description...</p>
    // <p>Price: 100 TL</p>

    // However, without seeing the HTML, we'll try a heuristic approach.
    // We'll iterate elements and look for "blocks"

    // For now, let's just dump a flat list of text blocks to see what we have
    // and try to organize it.

    const $ = cheerio.load(html);
    const elements = $('body').children();

    const rawBlocks = [];
    elements.each((i, el) => {
        const text = clean($(el).text());
        if (text) rawBlocks.push(text);
    });

    // Write the raw blocks to JSON so we can inspect and write the REAL parser
    fs.writeFileSync(path.join(__dirname, 'raw-blocks.json'), JSON.stringify(rawBlocks, null, 2));
    console.log('Saved raw-blocks.json');

    // Heuristic based on inspection of raw-blocks.json
    console.log('Parsing products...');

    // Find start of products
    const startIdx = rawBlocks.findIndex(b => b.includes('Hurma Çeşitlerimiz'));
    const endIdx = rawBlocks.findIndex(b => b.includes('Ürünlerimiz ve fiyatları'));

    if (startIdx === -1) {
        console.error('Could not find start marker "Hurma Çeşitlerimiz"');
        return;
    }

    // Extract About Text (Intro before "HURMANIN FAYDALARI")
    // Usually indices 0 to ...
    const aboutText = rawBlocks.slice(2, 4).join('\n\n'); // Rough guess: indices 2 and 3 look like about text
    fs.writeFileSync(path.join(__dirname, 'about.json'), JSON.stringify({ aboutText }, null, 2));

    const productBlocks = rawBlocks.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx);

    const products = [];

    for (let i = 0; i < productBlocks.length; i++) {
        const text = productBlocks[i];

        // Skip garbage
        if (text === 'Hover Box Element') continue;

        // Assume short text is a Name
        if (text.length < 50) {
            const name = text;
            let description = null;

            // Check if next block is description (long text)
            if (i + 1 < productBlocks.length) {
                const nextText = productBlocks[i + 1];
                if (nextText.length >= 50 && nextText !== 'Hover Box Element') {
                    description = nextText;
                    i++; // Skip next block as we consumed it
                }
            }

            products.push({
                name,
                description,
                price: 0, // Prices are not in doc
                unit: 'KG',
                isActive: true,
                category: 'hurma' // Default category
            });
        }
    }

    console.log(`Found ${products.length} products.`);
    fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(products, null, 2));
    console.log('Saved products.json');
}

parseContent().catch(err => console.error(err));
