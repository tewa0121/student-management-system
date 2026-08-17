const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const errorHandler = require('./middleware/errorHandler');
const academicYearRoutes = require('./routes/academicYearRoutes');

const app = express();

// --- CORS: allow all origins (for development) ---
app.use(cors({
  origin: true,                // reflect the request origin
  credentials: true,           // allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// No need for app.options('*', cors()) – the above middleware handles it

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic-years', academicYearRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;