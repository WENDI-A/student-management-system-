const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const db = require('./config/InitDatabase');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');
const fs = require('fs');
const UPLOAD_DIR = path.join(__dirname, '/uploads');
require('dotenv').config();


app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
// Serve static files with custom middleware to handle downloads
app.use('/uploads', (req, res, next) => {
  // Decode the URL-encoded path to handle spaces (%20) and other special characters
  const decodedPath = decodeURIComponent(req.path);
  console.log('Original path:', req.path);
  console.log('Decoded path:', decodedPath);
  const filePath = path.join(UPLOAD_DIR, decodedPath);

  // Check if download parameter is present
  if (req.query.download === 'true') {
    // Get the file name
    const fileName = path.basename(filePath);

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    // Determine content type
    const contentType = require('mime-types').lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      if (!res.headersSent) {
        res.status(404).send('File not found');
      }
    });

    fileStream.pipe(res);
  } else {
    // Normal static file serving
    express.static(UPLOAD_DIR)(req, res, next);
  }
});



console.log('Upload directory:', UPLOAD_DIR);
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const startServer = async () => {
  try {
    const dbInfo = await db.initialize();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Database: ${dbInfo.database} (${dbInfo.tableCount} tables)`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1)
});


module.exports = app;
