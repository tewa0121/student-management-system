const { pool } = require('../config/db');

const getFeeCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fee_categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFeeCategories };