const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Enable CORS
app.use(cors());

// Create uploads directory if it doesn't exist with error handling
const uploadDir = path.join(__dirname, 'uploads');

// Diagnostics code to check permissions
console.log('------- PDF SERVER DIAGNOSTICS -------');
console.log('Current directory:', __dirname);
console.log('Upload directory:', uploadDir);
try {
  if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads directory created at:', uploadDir);
  } else {
    console.log('Uploads directory already exists at:', uploadDir);
    
    // Check directory permissions
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log('Directory is writable');
    } catch (err) {
      console.error('Directory is not writable:', err.message);
    }
  }
  
  // Test creating a file
  const testFile = path.join(uploadDir, 'test-permissions.txt');
  fs.writeFileSync(testFile, 'Testing write permissions');
  console.log('Successfully created test file:', testFile);
  fs.unlinkSync(testFile);
  console.log('Successfully deleted test file');
} catch (error) {
  console.error('ERROR with directory operations:', error);
}
console.log('--------------------------------------');

// Serve static files from the uploads directory using absolute path
app.use('/uploads', express.static(uploadDir));

// Configure multer for file storage with improved error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists before saving
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created directory on demand: ${uploadDir}`);
      } catch (err) {
        console.error(`Failed to create directory: ${err.message}`);
        return cb(new Error(`Cannot create upload directory: ${err.message}`), null);
      }
    }
    cb(null, uploadDir); // Use absolute path instead of relative
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Log incoming file details
    console.log('Receiving file:', file.originalname, 'Size:', file.size);
    cb(null, true);
  }
}).single('file');

// File upload endpoint with improved error handling
app.post('/upload', (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      console.error('Error during file upload:', err);
      return res.status(500).json({ error: `File upload failed: ${err.message}` });
    }
    
    if (!req.file) {
      console.error('No file received in upload request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log(`File uploaded successfully: ${req.file.path}`);
    
    // Create the URL to the uploaded file
    const fileUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
    console.log(`File URL: ${fileUrl}`);
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      filePath: req.file.path
    });
  });
});

// Add a simple status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'PDF Upload Server is running',
    uploadEndpoint: '/upload',
    method: 'POST',
    serverUrl: SERVER_URL,
    uploadsDirectory: uploadDir
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`Visit ${SERVER_URL} to check server status`);
}); 