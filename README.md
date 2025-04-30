# React PDF Generator

This is a React application that generates PDF documents about real estate and allows sharing them via social media and messaging platforms.

## Features

- Dynamic PDF generation with html2pdf.js
- PDF sharing via Facebook, VK, Telegram, WhatsApp, and Email
- Integrated server for PDF storage and sharing

## Integrated Structure

This project now has both the React frontend and Express backend in a single repository:

```
react-pdf-test/
├── node_modules/
├── public/
├── server/
│   └── uploads/
├── src/
└── package.json
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
- `server/uploads/`: Directory for storing uploaded PDFs

### API Endpoints

- `POST /upload`: Upload a PDF file
- `GET /uploads/:filename`: Retrieve a PDF file
- `GET /api`: Check server status

## Customization

You can customize the PDF content by modifying the template in `App.js`. The sharing functionality can be extended with additional platforms as needed.

## Important Security Considerations

- For production environments, implement proper authentication and authorization
- Set file size limits to prevent abuse
- Consider using HTTPS for secure file transfers
- Implement rate limiting to prevent DoS attacks

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

# PDF Server File Permission Fix

## Problem
The PDF generation works locally but fails on the remote server due to permission issues when creating files in the `uploads` directory.

## Solution

### 1. Check and fix server directory permissions

SSH into your server and run these commands:

```bash
# Navigate to your application directory
cd /path/to/your/app

# Create the uploads directory if it doesn't exist
mkdir -p server/uploads
mkdir -p pdf-server/uploads

# Set proper permissions (replace www-data with your web server user)
sudo chown -R www-data:www-data server/uploads
sudo chown -R www-data:www-data pdf-server/uploads

# Set directory permissions to 755 (rwxr-xr-x)
sudo chmod -R 755 server/uploads
sudo chmod -R 755 pdf-server/uploads
```

