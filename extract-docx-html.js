const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "hurma.docx");

console.log("Converting DOCX to HTML:", filePath);

mammoth.convertToHtml({ path: filePath })
    .then(result => {
        const html = result.value; // The generated HTML
        const messages = result.messages; // Any messages
        console.log("--- START EXTRACTED HTML ---");
        console.log(html);
        console.log("--- END EXTRACTED HTML ---");
        if (messages.length > 0) {
            console.log("Messages:", messages);
        }
    })
    .catch(error => {
        console.error("Error converting to HTML:", error);
    });
