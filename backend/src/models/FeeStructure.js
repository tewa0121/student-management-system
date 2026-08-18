const { pool } = require('../config/db');

const FeeStructure = {
  findAll: async (filters = {}) => {
    let query = `SELECT fs.*, a.name as academicYear, c.name as className, fc.name as categoryName 
                 FROM fee_structures fs 
                 JOIN academic_years a ON fs.academicYearId = a.id 
                 JOIN classes c ON fs.classId = c.id 
                 JOIN fee_categories fc ON fs.categoryId = fc.id`;
    const params = [];
    const conditions = [];
    if (filters.academicYearId) { conditions.push('fs.academicYearId = ?'); params.push(filters.academicYearId); }
    if (filters.classId) { conditions.push('fs.classId = ?'); params.push(filters.classId); }
    if (filters.categoryId) { conditions.push('fs.categoryId = ?'); params.push(filters.categoryId); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY fs.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM fee_structures WHERE id = ?', [id]);
    return rows[0];
  },
  create: async (data) => {
    const { academicYearId, classId, categoryId, amount, isOptional } = data;
    const [result] = await pool.query(
      `INSERT INTO fee_structures (academicYearId, classId, categoryId, amount, isOptional) VALUES (?, ?, ?, ?, ?)`,
      [academicYearId, classId, categoryId, amount, isOptional || false]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['academicYearId', 'classId', 'categoryId', 'amount', 'isOptional'];
    for (const field of allowed) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE fee_structures SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM fee_structures WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = FeeStructure;