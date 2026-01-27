const sharp = require('sharp');
const path = require('path');

const pdfPath = 'Nuvva2025 - 2.pdf';

sharp(pdfPath)
    .metadata()
    .then(metadata => {
        console.log('PDF Metadata:', metadata);
    })
    .catch(err => {
        console.error('Sharp PDF Error:', err);
    });
