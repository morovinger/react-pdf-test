const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

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
  fs.mkdirSync(uploadDir, { recursive: true });
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

// Simple captcha session storage
// In a production app, you'd use a proper session store or database
const captchaSessions = {};

// Generate a simple math captcha
app.get('/api/captcha', (req, res) => {
  // Generate two random numbers between 1 and 10
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  
  // Create a session ID
  const sessionId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
  
  // Store the expected answer
  captchaSessions[sessionId] = {
    answer: num1 + num2,
    createdAt: Date.now() // For cleanup purposes
  };
  
  // Clean up old sessions (older than 10 minutes)
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  Object.keys(captchaSessions).forEach(key => {
    if (captchaSessions[key].createdAt < tenMinutesAgo) {
      delete captchaSessions[key];
    }
  });
  
  // Send the question and session ID
  res.json({
    sessionId: sessionId,
    question: `${num1} + ${num2} = ?`
  });
});

// Verify captcha middleware
const verifyCaptcha = (req, res, next) => {
  const { captchaSessionId, captchaAnswer } = req.body;
  
  // Check if session exists
  if (!captchaSessionId || !captchaSessions[captchaSessionId]) {
    return res.status(403).json({ error: 'Invalid or expired captcha session' });
  }
  
  // Check answer
  const expectedAnswer = captchaSessions[captchaSessionId].answer;
  const providedAnswer = parseInt(captchaAnswer, 10);
  
  if (isNaN(providedAnswer) || providedAnswer !== expectedAnswer) {
    return res.status(403).json({ error: 'Incorrect captcha answer' });
  }
  
  // Captcha passed, remove the session to prevent reuse
  delete captchaSessions[captchaSessionId];
  
  // Continue to the next middleware
  next();
};

// File upload endpoint with captcha verification
app.post('/upload', upload.single('file'), (req, res) => {
  // First check captcha
  const { captchaSessionId, captchaAnswer } = req.body;
  
  if (!captchaSessionId || !captchaSessions[captchaSessionId]) {
    return res.status(403).json({ error: 'Invalid or expired captcha session' });
  }
  
  const expectedAnswer = captchaSessions[captchaSessionId].answer;
  const providedAnswer = parseInt(captchaAnswer, 10);
  
  if (isNaN(providedAnswer) || providedAnswer !== expectedAnswer) {
    return res.status(403).json({ error: 'Incorrect captcha answer' });
  }
  
  // Captcha passed, remove the session to prevent reuse
  delete captchaSessions[captchaSessionId];

  // Now check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Create the URL to the uploaded file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
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
    captchaEndpoint: '/api/captcha',
    method: 'GET'
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
  console.log(`API status available at http://localhost:${PORT}/api`);
  console.log(`File upload endpoint: http://localhost:${PORT}/upload`);
  console.log(`Captcha endpoint: http://localhost:${PORT}/api/captcha`);
}); 