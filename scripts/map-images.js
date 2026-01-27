const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'products');
const productsPath = path.join(__dirname, 'products.json');

function normalize(str) {
    return str.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '');
}

async function main() {
    console.log('Mapping images to JSON...');

    // Read JSON
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const files = fs.readdirSync(imagesDir);

    let updatedCount = 0;

    const updatedProducts = products.map(product => {
        const normName = normalize(product.name);

        let match = files.find(f => normalize(f.split('.')[0]) === normName);

        if (!match) {
            match = files.find(f => {
                const normFile = normalize(f.split('.')[0]);
                return normFile === normName || normFile.includes(normName) || normName.includes(normFile);
            });
        }

        if (match) {
            console.log(`Matched "${product.name}" -> "${match}"`);
            return {
                ...product,
                image: `/products/${match}`
            };
        } else {
            console.log(`No match for "${product.name}"`);
            return product;
        }
    });

    // Write back
    fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
    console.log('Updated products.json');
}

main();
