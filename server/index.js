const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

// Create logs directory for persistent logging
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('Created logs directory at:', logsDir);
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
}

// Custom logging function that writes to console and file
function logToFile(message, isError = false) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  
  // Log to console
  if (isError) {
    console.error(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
  
  // Log to file
  try {
    const logFile = path.join(logsDir, isError ? 'error.log' : 'server.log');
    fs.appendFileSync(logFile, formattedMessage + '\n');
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
}

// Check if running on HTTPS
const isHttps = SERVER_URL.startsWith('https://');
if (!isHttps) {
  logToFile('WARNING: Server is running over HTTP, not HTTPS. This may cause security warnings in the browser when handling blobs.', true);
  logToFile('Consider configuring HTTPS with a valid certificate for production use.', true);
}

// Enable CORS with proper options
app.use(cors({
  origin: '*', // In production, you should specify your domains
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

// Add JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist with error handling
const uploadDir = path.join(__dirname, 'uploads');

// Diagnostics code to check permissions
logToFile('------- SERVER DIAGNOSTICS -------');
logToFile(`Current directory: ${__dirname}`);
logToFile(`Upload directory: ${uploadDir}`);
logToFile(`Node.js version: ${process.version}`);
logToFile(`Operating system: ${process.platform} ${process.arch}`);

try {
  if (!fs.existsSync(uploadDir)) {
    logToFile('Creating uploads directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
    logToFile(`Uploads directory created at: ${uploadDir}`);
    
    // Set directory permissions if on Linux/Unix
    if (process.platform !== 'win32') {
      try {
        const chmod = require('child_process').execSync(`chmod -R 777 ${uploadDir}`);
        logToFile(`Set permissions on uploads directory: ${chmod}`);
      } catch (chmodErr) {
        logToFile(`Failed to set directory permissions: ${chmodErr.message}`, true);
      }
    }
  } else {
    logToFile(`Uploads directory already exists at: ${uploadDir}`);
    
    // Check directory permissions
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      logToFile('Directory is writable');
      
      // List existing files in directory
      const files = fs.readdirSync(uploadDir);
      logToFile(`Files in uploads directory (${files.length}): ${files.join(', ')}`);
    } catch (err) {
      logToFile(`Directory is not writable: ${err.message}`, true);
      
      // Try to fix permissions if on Linux/Unix
      if (process.platform !== 'win32') {
        try {
          const chmod = require('child_process').execSync(`chmod -R 777 ${uploadDir}`);
          logToFile(`Attempted to fix permissions: ${chmod}`);
        } catch (chmodErr) {
          logToFile(`Failed to fix directory permissions: ${chmodErr.message}`, true);
        }
      }
    }
  }
  
  // Test creating a file
  const testFile = path.join(uploadDir, 'test-permissions.txt');
  fs.writeFileSync(testFile, 'Testing write permissions');
  logToFile(`Successfully created test file: ${testFile}`);
  const stats = fs.statSync(testFile);
  logToFile(`Test file stats: size=${stats.size}, mode=${stats.mode.toString(8)}, uid=${stats.uid}, gid=${stats.gid}`);
  fs.unlinkSync(testFile);
  logToFile('Successfully deleted test file');
} catch (error) {
  logToFile(`ERROR with directory operations: ${error.stack || error.message}`, true);
}
logToFile('----------------------------------');

// Update the default uploads static file serving to set proper content type
app.use('/uploads', express.static(uploadDir, {
  setHeaders: function (res, path) {
    // Set proper Content-Type header
    if (path.endsWith('.pdf')) {
      // For PDFs in normal viewing mode, set correct PDF content type
      res.set('Content-Type', 'application/pdf');
    }
    
    // Set caching headers to avoid caching issues
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Configure multer for file storage with improved error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists before saving
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        logToFile(`Created directory on demand: ${uploadDir}`);
      } catch (err) {
        logToFile(`Failed to create directory: ${err.message}`, true);
        return cb(new Error(`Cannot create upload directory: ${err.message}`), null);
      }
    }
    
    // Verify directory is writable
    try {
      const testPath = path.join(uploadDir, '.write-test');
      fs.writeFileSync(testPath, 'test');
      fs.unlinkSync(testPath);
    } catch (err) {
      logToFile(`Upload directory is not writable: ${err.message}`, true);
      return cb(new Error(`Upload directory is not writable: ${err.message}`), null);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.originalname;
    logToFile(`Generated filename for upload: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    // Log incoming file details
    logToFile(`Receiving file: ${file.originalname}, mimetype: ${file.mimetype}`);
    
    // Validate file type if needed
    if (file.mimetype !== 'application/pdf') {
      logToFile(`Warning: Uploaded file is not a PDF (${file.mimetype})`, true);
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('file');

// File upload endpoint with improved error handling
app.post('/upload', (req, res) => {
  logToFile(`Received upload request from: ${req.ip}`);
  
  upload(req, res, function(err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        logToFile(`File too large: ${err.message}`, true);
        return res.status(413).json({ error: 'File too large, maximum size is 10MB' });
      }
      
      logToFile(`Error during file upload: ${err.stack || err.message}`, true);
      return res.status(500).json({ error: `File upload failed: ${err.message}` });
    }
    
    if (!req.file) {
      logToFile('No file received in upload request', true);
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Verify the file exists after upload
    const filePath = req.file.path;
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        logToFile(`File uploaded successfully: path=${filePath}, size=${stats.size}bytes, permissions=${stats.mode.toString(8)}`);
      } else {
        logToFile(`ERROR: File not found after upload: ${filePath}`, true);
        return res.status(500).json({ error: 'File upload failed: file not found after upload' });
      }
    } catch (fsErr) {
      logToFile(`ERROR checking uploaded file: ${fsErr.message}`, true);
    }
    
    // Create the URL to the uploaded file using the server IP instead of localhost
    const fileUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
    logToFile(`File URL: ${fileUrl}`);
    
    // Log all files in upload directory after upload
    try {
      const files = fs.readdirSync(uploadDir);
      logToFile(`Files in uploads directory after upload (${files.length}): ${files.join(', ')}`);
    } catch (readErr) {
      logToFile(`Failed to read directory after upload: ${readErr.message}`, true);
    }
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      isHttps: isHttps
    });
  });
});

// API to check if a file exists
app.get('/check-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  logToFile(`Checking if file exists: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    logToFile(`File exists: ${filePath}, size=${stats.size}bytes`);
    res.json({
      exists: true,
      size: stats.size,
      url: `${SERVER_URL}/uploads/${filename}`
    });
  } else {
    logToFile(`File does not exist: ${filePath}`, true);
    res.json({
      exists: false
    });
  }
});

// Add a simple status endpoint
app.get('/api', (req, res) => {
  // List all files in the uploads directory
  let files = [];
  try {
    files = fs.readdirSync(uploadDir).map(file => {
      const stats = fs.statSync(path.join(uploadDir, file));
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime
      };
    });
  } catch (err) {
    logToFile(`Error reading upload directory: ${err.message}`, true);
  }
  
  res.json({
    status: 'PDF Upload Server is running',
    uploadEndpoint: '/upload',
    method: 'POST',
    serverUrl: SERVER_URL,
    uploadsDirectory: uploadDir,
    isHttps: isHttps,
    files: files
  });
});

// Add a dedicated download endpoint that forces download
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  logToFile(`Download request for file: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    logToFile(`Serving file for download: ${filePath}`);
  } else {
    logToFile(`File not found for download: ${filePath}`, true);
    res.status(404).send('File not found');
  }
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

// Global error handler
app.use((err, req, res, next) => {
  logToFile(`Unhandled error: ${err.stack || err.message}`, true);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logToFile(`Server running on port ${PORT}`);
  logToFile(`Server URL: ${SERVER_URL}`);
  logToFile(`API status available at ${SERVER_URL}/api`);
  logToFile(`File upload endpoint: ${SERVER_URL}/upload`);
  
  // Add info about HTTPS
  if (!isHttps) {
    logToFile('WARNING: Server is running on HTTP. For production use, configure HTTPS to avoid security warnings.', true);
  }
}); 