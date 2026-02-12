
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test-audio.mp3');
fs.writeFileSync(filePath, 'dummy audio content');

async function testUpload() {
    const formData = new FormData();
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'audio/mpeg' });
    formData.append('file', blob, 'test-audio.mp3');
    formData.append('title', 'Test API Upload');

    console.log('Sending upload request...');
    try {
        const res = await fetch('http://localhost:3000/api/tracks/upload', {
            method: 'POST',
            body: formData,
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Body:', text);
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        fs.unlinkSync(filePath);
    }
}

testUpload();
