const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Hardcoded server URL - this overrides any dynamic host detection
const SERVER_URL = 'http://104.36.85.100:3000';

// Enable CORS
app.use(cors());

// Add JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads directory created at:', uploadDir);
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // ALWAYS use the hardcoded SERVER_URL instead of dynamic detection
  const fileUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
  
  console.log(`File uploaded: ${req.file.filename}`);
  console.log(`File URL: ${fileUrl}`);
  
  res.json({
    message: 'File uploaded successfully',
    fileUrl: fileUrl
  });
});

// Add a simple status endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'PDF Upload Server is running',
    uploadEndpoint: '/upload',
    method: 'POST',
    serverUrl: SERVER_URL
  });
});

// Create a static nedvizhimost-document.pdf in the uploads directory
// This ensures we always have a static version to serve
const staticPdfPath = path.join(uploadDir, 'nedvizhimost-document.pdf');
// Copy the most recent PDF to the static filename if it doesn't exist
if (!fs.existsSync(staticPdfPath)) {
  try {
    const files = fs.readdirSync(uploadDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    if (pdfFiles.length > 0) {
      // Get most recent file based on timestamp in filename
      const mostRecentFile = pdfFiles.sort().reverse()[0];
      const sourcePath = path.join(uploadDir, mostRecentFile);
      
      // Copy the file to the static name
      fs.copyFileSync(sourcePath, staticPdfPath);
      console.log(`Created static PDF file from: ${mostRecentFile}`);
    }
  } catch (error) {
    console.error('Error creating static PDF file:', error);
  }
}

// Hardcoded endpoint for static PDF
app.get('/static-pdf', (req, res) => {
  console.log(`Serving static PDF: ${staticPdfPath}`);
  
  // Check if file exists
  if (fs.existsSync(staticPdfPath)) {
    // Force download with appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    // Use attachment instead of inline to force download
    res.setHeader('Content-Disposition', `attachment; filename="nedvizhimost-document.pdf"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(staticPdfPath);
    fileStream.pipe(res);
  } else {
    res.status(404).send('Static PDF not found');
  }
});

// Replace the old dynamic endpoint with a redirect to the static one
app.get('/download-pdf', (req, res) => {
  res.redirect('/static-pdf');
});

// Production setup - serve React app
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../build')));
  
  // For any request that doesn't match the above routes,
  // send the React index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL (hardcoded): ${SERVER_URL}`);
  console.log(`API status available at ${SERVER_URL}/api`);
  console.log(`File upload endpoint: ${SERVER_URL}/upload`);
  console.log(`Static PDF download link: ${SERVER_URL}/static-pdf`);
}); 