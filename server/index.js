const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || 'http://104.36.85.100:3000';

// Enable CORS
app.use(cors());

// Add JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist with error handling
const uploadDir = path.join(__dirname, 'uploads');

// Diagnostics code to check permissions
console.log('------- SERVER DIAGNOSTICS -------');
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
console.log('----------------------------------');

// Serve static files from the uploads directory
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
    cb(null, uploadDir);
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
    
    // Create the URL to the uploaded file using the server IP instead of localhost
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
app.get('/api', (req, res) => {
  res.json({
    status: 'PDF Upload Server is running',
    uploadEndpoint: '/upload',
    method: 'POST',
    serverUrl: SERVER_URL,
    uploadsDirectory: uploadDir
  });
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
  console.log(`Server URL: ${SERVER_URL}`);
  console.log(`API status available at ${SERVER_URL}/api`);
  console.log(`File upload endpoint: ${SERVER_URL}/upload`);
}); 