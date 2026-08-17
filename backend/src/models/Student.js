const { pool } = require('../config/db');

const Student = {
  findAll: async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR studentId LIKE ? OR admissionNo LIKE ?)';
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }
    if (filters.class) {
      query += ' AND class = ?';
      params.push(filters.class);
    }
    if (filters.section) {
      query += ' AND section = ?';
      params.push(filters.section);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  },

  countAll: async (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM students WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR studentId LIKE ? OR admissionNo LIKE ?)';
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }
    if (filters.class) {
      query += ' AND class = ?';
      params.push(filters.class);
    }
    if (filters.section) {
      query += ' AND section = ?';
      params.push(filters.section);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0];
  },

  findByStudentId: async (studentId) => {
    const [rows] = await pool.query('SELECT * FROM students WHERE studentId = ?', [studentId]);
    return rows[0];
  },

  findByAdmissionNo: async (admissionNo) => {
    const [rows] = await pool.query('SELECT * FROM students WHERE admissionNo = ?', [admissionNo]);
    return rows[0];
  },

  create: async (data) => {
    // Destructure 'class' as 'className' because 'class' is a reserved word
    const {
      userId, studentId, admissionNo, firstName, lastName, middleName,
      gender, dateOfBirth, placeOfBirth, nationality, bloodGroup,
      phone, email, address, city, region, country,
      class: className, section, rollNo, admissionDate, status,
      previousSchool, previousStudentId, medicalNotes, specialRequirements, notes
    } = data;

    const [result] = await pool.query(`
      INSERT INTO students (
        userId, studentId, admissionNo, firstName, lastName, middleName,
        gender, dateOfBirth, placeOfBirth, nationality, bloodGroup,
        phone, email, address, city, region, country,
        class, section, rollNo, admissionDate, status,
        previousSchool, previousStudentId, medicalNotes, specialRequirements, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, studentId, admissionNo, firstName, lastName, middleName,
      gender, dateOfBirth, placeOfBirth, nationality, bloodGroup,
      phone, email, address, city, region, country,
      className, section, rollNo, admissionDate, status || 'Active',
      previousSchool, previousStudentId, medicalNotes, specialRequirements, notes
    ]);

    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    const allowedFields = [
      'userId', 'firstName', 'lastName', 'middleName', 'gender', 'dateOfBirth',
      'placeOfBirth', 'nationality', 'bloodGroup', 'phone', 'email', 'address',
      'city', 'region', 'country', 'class', 'section', 'rollNo', 'admissionDate',
      'status', 'previousSchool', 'previousStudentId', 'medicalNotes',
      'specialRequirements', 'notes'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) return null;
    values.push(id);

    const [result] = await pool.query(
      `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  getClasses: async () => {
    const [rows] = await pool.query('SELECT DISTINCT class FROM students ORDER BY class');
    return rows.map(r => r.class);
  },

  getSections: async () => {
    const [rows] = await pool.query('SELECT DISTINCT section FROM students WHERE section IS NOT NULL ORDER BY section');
    return rows.map(r => r.section);
  }
};

module.exports = Student;