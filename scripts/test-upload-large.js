
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'large-test.mp3');
// Create a 3MB file
const buffer = Buffer.alloc(3 * 1024 * 1024, 'a');
fs.writeFileSync(filePath, buffer);

async function testUpload() {
    const formData = new FormData();
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'audio/mpeg' });
    formData.append('file', blob, 'large-test.mp3');
    formData.append('title', 'Large File Test');

    console.log('Sending 3MB upload request...');
    try {
        const res = await fetch('http://localhost:3000/api/tracks/upload', {
            method: 'POST',
            body: formData,
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text.substring(0, 500)); // First 500 chars to avoid huge logs
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        fs.unlinkSync(filePath);
    }
}

testUpload();
