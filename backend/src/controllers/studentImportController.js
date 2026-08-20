const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const generatePassword = () => Math.random().toString(36).slice(-8);

const createUserForStudent = async (email, firstName, lastName, role = 'student') => {
  const password = generatePassword();
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
    [email, hashed, firstName, lastName, role]
  );
  return { userId: result.insertId, password };
};

const importStudents = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let records = [];

    if (ext === 'csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => records.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      records = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Use CSV or Excel.' });
    }

    fs.unlinkSync(filePath);

    if (records.length === 0) {
      return res.status(400).json({ message: 'No records found in file' });
    }

    const required = ['studentId', 'firstName', 'lastName', 'email', 'class'];
    const first = records[0];
    const missing = required.filter(col => !(col in first));
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing columns: ${missing.join(', ')}. Required: ${required.join(', ')}`
      });
    }

    const results = { total: records.length, inserted: 0, errors: [] };
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const [index, row] of records.entries()) {
        try {
          const { studentId, firstName, lastName, email, class: className, section, gender, dateOfBirth, phone, address } = row;

          const [existing] = await connection.query('SELECT id FROM students WHERE studentId = ?', [studentId]);
          if (existing.length > 0) {
            results.errors.push({ row: index + 1, studentId, error: 'Student ID already exists' });
            continue;
          }

          const [userExists] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
          if (userExists.length > 0) {
            results.errors.push({ row: index + 1, studentId, error: 'Email already registered' });
            continue;
          }

          const { userId, password } = await createUserForStudent(email, firstName, lastName);

          await connection.query(
            `INSERT INTO students 
             (userId, studentId, firstName, lastName, email, class, section, gender, dateOfBirth, phone, address, admissionDate, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Active')`,
            [userId, studentId, firstName, lastName, email, className || '', section || '', gender || '', dateOfBirth || null, phone || '', address || '']
          );
          results.inserted++;
        } catch (rowError) {
          results.errors.push({
            row: index + 1,
            studentId: row.studentId || 'unknown',
            error: rowError.message
          });
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.status(201).json({
      message: `Import completed: ${results.inserted} inserted, ${results.errors.length} errors.`,
      results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
};

module.exports = { importStudents };