# React PDF Generator

A modern React application that dynamically generates PDF documents about real estate and enables sharing via multiple social media platforms.

## Features

- Dynamic PDF generation using html2pdf.js
- PDF download with automatic file handling
- Social media sharing (Facebook, VK, Telegram, WhatsApp)
- Email sharing capability
- Server-based PDF storage for persistent access
- Responsive design for all devices

## Project Structure

```
react-pdf-test/
├── node_modules/
├── public/
├── server/
│   ├── logs/      # Server logs
│   └── uploads/   # PDF storage
├── src/           # React frontend
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-pdf-test
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
# Development environment
SERVER_URL=http://localhost:4500
PORT=4500
NODE_ENV=development
UPLOAD_DIR=uploads
DEBUG=true
```

### Running the Application

For development (with hot reloading):
```bash
npm run dev:local
```

This starts:
- React development server on port 4000
- Express backend server on port 4500

For production:
```bash
npm run build
NODE_ENV=production npm run server
```

## How It Works

### PDF Generation Process

1. **Creation**: When a user clicks "Скачать PDF", the app generates a PDF using html2pdf.js
2. **Download**: The PDF is automatically downloaded to the user's device
3. **Upload**: The PDF is simultaneously uploaded to the server
4. **Sharing**: Once uploaded, the PDF can be shared via various platforms

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload a PDF file |
| `/uploads/:filename` | GET | View a PDF in the browser |
| `/download/:filename` | GET | Download a PDF directly |
| `/check-file/:filename` | GET | Verify if a file exists |
| `/api` | GET | Server status and file list |

## Environment Configuration

### Production Environment

```
SERVER_URL=http://your-production-domain:4500
PORT=4500
NODE_ENV=production
```

### Development Environment

```
SERVER_URL=http://localhost:4500
PORT=4500
NODE_ENV=development
UPLOAD_DIR=uploads
DEBUG=true
```

## PDF Download Configuration

The server handles PDF files in two ways:

1. **Browser Viewing**:
   - URL: `/uploads/:filename`
   - Example: `http://localhost:4500/uploads/document.pdf`
   - Content-Type: application/pdf

2. **Direct Download**:
   - URL: `/download/:filename`
   - Example: `http://localhost:4500/download/document.pdf`
   - Content-Disposition: attachment

## Troubleshooting

### Server Logs

Server activity is logged in:
- `server/logs/server.log` - General logs
- `server/logs/error.log` - Error logs

### Common Issues

**Port conflicts**: If port 4000 or 4500 is already in use, update your `.env` file and package.json with different ports.

**Permission issues**: Ensure the server has write access to the `server/uploads` directory:

```bash
# On Linux/Mac
sudo chown -R $(whoami) server/uploads
chmod -R 755 server/uploads
```

**HTTPS errors**: When sharing PDFs, you may see security warnings if using HTTP instead of HTTPS. For production, configure an SSL certificate:

```javascript
// server/index.js
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('/path/to/privkey.pem'),
  cert: fs.readFileSync('/path/to/fullchain.pem')
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
```

## Advanced Customization

### PDF Content

Modify the PDF template in `src/App.js` by updating:
- `pageOneTitle` and `pageOneContent`
- `pageTwoTitle` and `pageTwoContent`
- Replace `placeholderImage` with your own image

### Styling

The app styling is contained in `src/App.css`. Key classes:
- `.pdf-container` - Main PDF wrapper
- `.doc-title` - PDF title styling
- `.content-section` - Content block styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF generation
- [Express](https://expressjs.com/) for the server implementation
- [React](https://reactjs.org/) for the frontend framework

