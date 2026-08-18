const { pool } = require('../config/db');

const Section = {
  findAll: async (classId = null) => {
    let query = 'SELECT * FROM sections';
    const params = [];
    if (classId) {
      query += ' WHERE classId = ?';
      params.push(classId);
    }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM sections WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { classId, name, teacherId, capacity } = data;
    
    // Convert teacherId: if it's not a valid positive integer, set to null
    let teacherIdValue = null;
    if (teacherId && !isNaN(parseInt(teacherId)) && parseInt(teacherId) > 0) {
      teacherIdValue = parseInt(teacherId);
    }
    
    const capacityValue = capacity && !isNaN(parseInt(capacity)) ? parseInt(capacity) : 0;
    
    console.log('📥 Inserting section:', { classId, name, teacherIdValue, capacityValue });
    
    const [result] = await pool.query(
      'INSERT INTO sections (classId, name, teacherId, capacity) VALUES (?, ?, ?, ?)',
      [classId, name, teacherIdValue, capacityValue]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.classId !== undefined) { fields.push('classId = ?'); values.push(data.classId); }
    if (data.teacherId !== undefined) {
      let teacherIdValue = null;
      if (data.teacherId && !isNaN(parseInt(data.teacherId)) && parseInt(data.teacherId) > 0) {
        teacherIdValue = parseInt(data.teacherId);
      }
      fields.push('teacherId = ?');
      values.push(teacherIdValue);
    }
    if (data.capacity !== undefined) {
      const val = data.capacity && !isNaN(parseInt(data.capacity)) ? parseInt(data.capacity) : 0;
      fields.push('capacity = ?');
      values.push(val);
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE sections SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM sections WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Section;