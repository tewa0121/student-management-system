// const { pool } = require('../config/db');
// const xlsx = require('xlsx');

// const exportStudents = async (req, res, next) => {
//   try {
//     const { format = 'csv', search, class: className, status } = req.query;

//     let query = `SELECT studentId, firstName, lastName, email, class, section, gender, phone, address, status, admissionDate 
//                  FROM students WHERE 1=1`;
//     const params = [];
//     if (search) {
//       query += ' AND (firstName LIKE ? OR lastName LIKE ? OR studentId LIKE ? OR email LIKE ?)';
//       const like = `%${search}%`;
//       params.push(like, like, like, like);
//     }
//     if (className) {
//       query += ' AND class = ?';
//       params.push(className);
//     }
//     if (status) {
//       query += ' AND status = ?';
//       params.push(status);
//     }
//     query += ' ORDER BY id DESC';

//     const [rows] = await pool.query(query, params);

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'No students found to export' });
//     }

//     if (format === 'csv') {
//       const header = Object.keys(rows[0]).join(',');
//       const csvRows = rows.map(row => Object.values(row).join(','));
//       const csv = [header, ...csvRows].join('\n');
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.csv`);
//       return res.send(csv);
//     } else {
//       const ws = xlsx.utils.json_to_sheet(rows);
//       const wb = xlsx.utils.book_new();
//       xlsx.utils.book_append_sheet(wb, ws, 'Students');
//       const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', `attachment; filename=students_${Date.now()}.xlsx`);
//       return res.send(buffer);
//     }
//   } catch (error) {
//     console.error('Export error:', error);
//     res.status(500).json({ message: 'Export failed', error: error.message });
//   }
// };

// module.exports = { exportStudents };