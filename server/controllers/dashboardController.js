const db = require("../config/db");

const getDashboardStats = (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM students) AS totalStudents,
      (SELECT COUNT(*) FROM teachers) AS totalTeachers
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  });
};

module.exports = {
  getDashboardStats,
};