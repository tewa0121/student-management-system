const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  // Send detailed error in development (for debugging)
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    stack: err.stack,
  });
};

module.exports = errorHandler;