const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const productsJsonPath = path.join(__dirname, 'products.json');
const imagesDir = path.join(__dirname, '..', 'public', 'products');

async function main() {
    console.log('Starting optimization...');

    if (!fs.existsSync(productsJsonPath)) {
        console.error('products.json not found!');
        process.exit(1);
    }

    let products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    let updated = false;

    // Process each product
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        if (p.image && p.image.endsWith('.png')) {
            const pngName = path.basename(p.image);
            const jpgName = pngName.replace(/\.png$/i, '.jpg');

            const inputPath = path.join(imagesDir, pngName);
            const outputPath = path.join(imagesDir, jpgName);

            if (fs.existsSync(inputPath)) {
                console.log(`Optimizing ${pngName} -> ${jpgName}`);
                try {
                    await sharp(inputPath)
                        .resize(800, 800, { fit: 'inside' })
                        .jpeg({ quality: 80, mozjpeg: true })
                        .toFile(outputPath);

                    // Update JSON reference
                    p.image = p.image.replace(/\.png$/i, '.jpg');
                    updated = true;

                    // Optional: Delete original PNG? 
                    // Let's keep it for safety for now, or maybe delete to save space?
                    // User probably wants working app first.
                } catch (err) {
                    console.error(`Failed to optimize ${pngName}:`, err);
                }
            } else {
                console.warn(`Image file not found: ${inputPath}`);
            }
        }
    }

    if (updated) {
        fs.writeFileSync(productsJsonPath, JSON.stringify(products, null, 2));
        console.log('Updated products.json with new image paths.');
    } else {
        console.log('No changes made to products.json.');
    }
}

main();
