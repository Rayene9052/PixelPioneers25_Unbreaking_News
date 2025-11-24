const multer = require('multer'); 

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      error: 'File upload error',
      message: err.message 
    });
  }
  
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
