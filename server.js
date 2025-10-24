const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs').promises;
const mime = require('mime-types');

const port = parseInt(process.env.PORT, 10) || 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Function to get MIME type
function getContentType(ext) {
  return mime.lookup(ext) || 'application/octet-stream';
}

app.prepare().then(() => {
  const server = express();

  // Serve uploaded files directly
  server.get('/uploads/*', async (req, res) => {
    try {
      // Extract filename from the URL path
      const urlPath = req.url;
      if (urlPath.startsWith('/uploads/')) {
        const filename = urlPath.replace('/uploads/', '');
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

        // Check if file exists
        await fs.access(filePath);
        
        // Read the file
        const fileBuffer = await fs.readFile(filePath);
        
        // Set appropriate content type
        const contentType = getContentType(path.extname(filename));
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        
        // Send the file
        res.send(fileBuffer);
      } else {
        // Not an upload URL, pass to Next.js
        handle(req, res);
      }
    } catch (error) {
      // If file doesn't exist, let Next.js handle it (404 or other route)
      handle(req, res);
    }
  });

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});