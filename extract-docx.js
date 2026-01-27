const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "hurma.docx");

console.log("Extracting text from:", filePath);

mammoth.extractRawText({ path: filePath })
    .then(result => {
        const text = result.value; // The raw text
        const messages = result.messages; // Any messages, such as warnings during conversion
        console.log("--- START EXTRACTED TEXT ---");
        console.log(text);
        console.log("--- END EXTRACTED TEXT ---");
        if (messages.length > 0) {
            console.log("Messages:", messages);
        }
    })
    .catch(error => {
        console.error("Error extracting text:", error);
    });
