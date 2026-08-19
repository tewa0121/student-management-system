const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const academicYearRoutes = require('./routes/academicYearRoutes');
const termRoutes = require('./routes/termRoutes');
const classRoutes = require('./routes/classRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const feeStructureRoutes = require('./routes/feeStructureRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const feeCategoryRoutes = require('./routes/feeCategoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const libraryRoutes = require('./routes/libraryRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- CORS: allow all origins (development only) ---
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ⚠️ REMOVED: app.options('*', cors()); // This line caused the error!

// Security & logging
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fee-structures', feeStructureRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/fee-categories', feeCategoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/library', libraryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;