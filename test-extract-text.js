const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('Nuvva2025 - 2.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
});
