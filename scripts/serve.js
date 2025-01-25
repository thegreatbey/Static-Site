const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '../dist', req.url === '/' ? 'index.html' : req.url);
    
    // Add debug logging
    console.log('Requested URL:', req.url);
    console.log('Looking for file:', filePath);

    // Check if file exists before trying to read it
    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        res.writeHead(404);
        res.end('404 - File Not Found');
        return;
    }
    
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
    }[path.extname(filePath)] || 'text/plain';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 - Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${path.join(__dirname, '../dist')}`);
}); 