const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
    const inputDir = path.join(__dirname, 'extracted_raw');
    const outputDir = path.join(__dirname, 'public/products');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const files = fs.readdirSync(inputDir);

    for (const file of files) {
        if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
            const inputPath = path.join(inputDir, file);
            const outputFilename = path.parse(file).name + '.jpg';
            const outputPath = path.join(outputDir, outputFilename);

            console.log(`Optimizing ${file}...`);

            try {
                await sharp(inputPath)
                    .resize(800) // Resize to 800px width, auto height
                    .jpeg({ quality: 80 })
                    .toFile(outputPath);
                console.log(`Saved ${outputFilename}`);
            } catch (err) {
                console.error(`Error optimizing ${file}:`, err);
            }
        }
    }
}

optimizeImages();
