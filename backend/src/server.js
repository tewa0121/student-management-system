const app = require('./app');
const { initDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();