# React PDF Generator

This is a React application that generates PDF documents about real estate and allows sharing them via social media and messaging platforms.

## Features

- Dynamic PDF generation with html2pdf.js
- PDF sharing via Facebook, VK, Telegram, WhatsApp, and Email
- Integrated server for PDF storage and sharing
- Automatic PDF download functionality

## Integrated Structure

This project has both the React frontend and Express backend in a single repository:

```
react-pdf-test/
├── node_modules/
├── public/
├── server/
│   ├── logs/
│   └── uploads/
├── src/
└── package.json
```

## How The Application Works

### Architecture Overview

This application has a client-server architecture with both components integrated into a single repository:

#### Frontend (React)
- **Location**: `/src` directory
- **Technology**: React 19.1
- **Responsibility**: UI and PDF generation in the browser
- **Default Port**: 3000 (development mode)

**Settings**:
```
# .env or .env.development
REACT_APP_PORT=3000       # React development server port
```

#### Backend (Express)
- **Location**: `/server` directory
- **Technology**: Express.js
- **Responsibility**: File uploads, storage, and serving
- **Default Port**: 3001

**Settings**:
```
# .env
PORT=3001                 # Express server port
SERVER_URL=http://localhost:3001  # Public URL for file access
```

### Startup Process

When you run `npm run dev`, two processes are started concurrently:

1. **Express Server** (`npm run server`):
   - Loads environment variables from `.env` using dotenv
   - Sets up routes for file uploads, downloads, and API endpoints
   - Creates logs and uploads directories if they don't exist
   - Binds to PORT from environment variables (defaults to 3001)

2. **React Development Server** (`npm run start`):
   - Started by react-scripts
   - Serves the React application with hot reloading
   - Also reads from `.env` file, particularly looking for PORT
   - Defaults to port 3000 if not specified

**Settings**:
```json
// package.json scripts
"scripts": {
  "start": "react-scripts start",
  "server": "node server/index.js",
  "dev": "concurrently \"npm run server\" \"npm run start\"",
  "dev:local": "cross-env NODE_ENV=development concurrently \"npm run server\" \"npm run start\""
}
```

### Port Configuration

**Important**: To avoid port conflicts, use different ports for React and Express:

```
# For Express (.env)
PORT=3001
SERVER_URL=http://localhost:3001

# For React (.env.development)
PORT=3000
```

If both servers try to use the same port (e.g., both reading PORT=3003 from .env), you'll get the error: "Something is already running on port 3003".

### Data Flow for PDF Generation

1. **User Interaction**:
   - User views the application at http://localhost:3000 
   - Clicks "Скачать PDF о недвижимости" button

2. **PDF Generation on Client**:
   - Frontend uses html2pdf.js to generate PDF in the browser
   - Converts the HTML content to a PDF blob
   - Downloads the PDF to the user's device

   **Settings**:
   ```javascript
   // PDF generation options (App.js)
   const options = {
     margin: 10,
     filename: 'nedvizhimost-document.pdf',
     image: { type: 'jpeg', quality: 0.98 },
     html2canvas: { 
       scale: 2,
       useCORS: true,
       letterRendering: true
     },
     jsPDF: { 
       unit: 'mm', 
       format: 'a4', 
       orientation: 'portrait'
     }
   };
   ```

3. **PDF Upload to Server**:
   - The PDF blob is sent to the server via a POST request to `/upload`
   - Server saves the file to `/server/uploads/` directory
   - Server returns a URL to the saved file

   **Settings**:
   ```javascript
   // Server file upload configuration (server/index.js)
   const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, uploadDir);
     },
     filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       cb(null, uniqueSuffix + '-' + file.originalname);
     }
   });
   ```

4. **File Serving**:
   - Files are stored in `/server/uploads/`
   - Server provides two endpoints:
     - `/uploads/:filename` - for viewing files in browser
     - `/download/:filename` - for forcing download

   **Settings**:
   ```javascript
   // View file configuration
   app.use('/uploads', express.static(uploadDir, {
     setHeaders: function (res, path) {
       if (path.endsWith('.pdf')) {
         res.set('Content-Type', 'application/pdf');
       }
     }
   }));

   // Download file configuration
   app.get('/download/:filename', (req, res) => {
     // Force download with Content-Disposition header
     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
     res.setHeader('Content-Type', 'application/pdf');
   });
   ```

### Production Deployment

In production mode (`npm run build && npm run server`):

1. React app is compiled to static files in `/build`
2. Express server serves these static files alongside API endpoints
3. Everything runs through a single server on a single port

**Settings**:
```
# Production environment (.env)
NODE_ENV=production
PORT=3001  # or your preferred port
SERVER_URL=https://yourdomain.com  # Use HTTPS in production
```

## Setup

1. Install dependencies:
```
npm install
```

2. Start both the frontend and backend servers together:
```
npm run dev
```

This will:
- Start the React development server on port 3000
- Start the Express backend server on port 3001
- Run both servers concurrently

3. For production:
```
npm run build
NODE_ENV=production npm run server
```

This will:
- Build the React app
- Serve the static React app through the Express server
- Handle both the frontend and API requests from a single server

## How it Works

### PDF Generation

The application creates PDF documents using html2pdf.js. When you click "Скачать PDF", the app:
1. Generates the PDF document
2. Downloads it to your device
3. Uploads it to the server for sharing

### PDF Sharing

Generated PDFs can be shared via:
- Facebook
- VK
- Telegram
- WhatsApp
- Email

The PDF is uploaded to the server, which provides a permanent URL for sharing.

## Development

### Frontend Structure

The React app is in the `src/` directory with components for generating and sharing PDFs.

### Backend Structure

The Express server is in the `server/` directory:
- `server/index.js`: Main server file with API endpoints
- `server/logs/`: Directory for server logs
- `server/uploads/`: Directory for storing uploaded PDFs

### API Endpoints

- `POST /upload`: Upload a PDF file
- `GET /uploads/:filename`: View a PDF file in the browser
- `GET /download/:filename`: Download a PDF file directly
- `GET /check-file/:filename`: Verify if a file exists
- `GET /api`: Check server status and list existing files

## Customization

You can customize the PDF content by modifying the template in `App.js`. The sharing functionality can be extended with additional platforms as needed.

## Important Security Considerations

- For production environments, implement proper authentication and authorization
- Set file size limits to prevent abuse
- Consider using HTTPS for secure file transfers
- Implement rate limiting to prevent DoS attacks

# Environment Variables Setup

This application uses environment variables for configuration.

## Production Environment

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
SERVER_URL=http://104.36.85.100:3000
PORT=3001

# For production, use HTTPS (uncomment when you have a certificate)
# SERVER_URL=https://104.36.85.100:3000
# HTTPS=true

# Add any other environment variables your app needs here
NODE_ENV=production
```

## Local Development Environment

For local development, create a `.env.development` file or update your `.env` file with:

```
# Development environment configuration
SERVER_URL=http://localhost:3001
PORT=3001

# React development server port
REACT_APP_PORT=3000

# Other development settings
NODE_ENV=development

# PDF upload path (relative to server directory)
UPLOAD_DIR=uploads
```

When running in development mode, either set the NODE_ENV manually:

```bash
# For Windows
set NODE_ENV=development && npm run dev

# For Linux/Mac
NODE_ENV=development npm run dev
```

Or use the development script in package.json:

```json
"scripts": {
  "dev": "NODE_ENV=development concurrently \"npm run server\" \"npm run start\""
}
```

The application will use these values to configure the server. Make sure to adjust the SERVER_URL to match your domain or IP address.

# PDF Download Configuration

## Server Configuration for PDF Downloads

The server is configured to handle PDF files in two ways:

1. **View PDFs in the browser**: 
   - URL pattern: `/uploads/:filename`
   - Content-Type: application/pdf
   - Example: `http://yourdomain.com:3001/uploads/document.pdf`

2. **Force download of PDFs**:
   - URL pattern: `/download/:filename`
   - Content-Disposition: attachment
   - Example: `http://yourdomain.com:3001/download/document.pdf`

When sharing PDFs, you can choose either URL format depending on whether you want recipients to view the PDF in their browser or download it directly.

## PDF File Permissions

To ensure the server can create and serve PDF files, set proper permissions on the uploads directory:

```bash
# Navigate to your application directory
cd /path/to/your/app

# Create the uploads directory if it doesn't exist
mkdir -p server/uploads

# Set proper permissions (replace www-data with your web server user)
sudo chown -R www-data:www-data server/uploads

# Set directory permissions to 755 (rwxr-xr-x)
sudo chmod -R 755 server/uploads
```

# Troubleshooting

## HTTPS Configuration

The error message `blob:http://104.36.85.100:3000/f85c0748-b886-417b-93ec-a713bd592969 was loaded over an insecure connection` indicates a security issue with loading blob URLs over HTTP instead of HTTPS.

### Fix HTTPS Issue:

1. Set up HTTPS on your server using a valid SSL certificate:

```bash
# Install certbot for Let's Encrypt SSL
sudo apt-get update
sudo apt-get install certbot

# Get a certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com

# Configure your Node.js server to use HTTPS
```

2. Update your server code to use HTTPS:

```javascript
const https = require('https');
const fs = require('fs');
const app = express();

// Your existing Express setup...

// HTTPS configuration
const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

// Create HTTPS server
https.createServer(httpsOptions, app).listen(3001, () => {
  console.log('HTTPS Server running on port 3001');
});
```

3. Update your environment variables:
```
# Set the server URL to use HTTPS
SERVER_URL=https://yourdomain.com:3001
```

## Enhanced Logging for Troubleshooting

The server includes enhanced logging that will help diagnose any file permission issues:

1. Server logs are saved to:
   - `server/logs/server.log` - General server logs
   - `server/logs/error.log` - Error logs

2. Diagnostic information is logged on server startup:
   - Current directory
   - Upload directory location and permissions
   - File system access tests
   - Existing files in uploads directory

3. Each upload operation logs:
   - Incoming file details
   - File path, size, and permissions
   - All files in the directory after upload
   - Any errors encountered during the process

## File Permission Verification

If the server has trouble creating PDF files, check the diagnostic information in the logs:

```bash
# View the server logs
cat server/logs/server.log

# Check for errors
cat server/logs/error.log

# Check directory permissions
ls -la server/uploads
```

## Troubleshooting API Endpoints

The server has additional endpoints to help with troubleshooting:

1. `/api` - Check server status and see all files in the uploads directory
2. `/check-file/:filename` - Verify if a specific file exists on the server 

Example usage:
```
GET http://yourdomain.com:3001/api
GET http://yourdomain.com:3001/check-file/1621345678-987654321-nedvizhimost-document.pdf
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

