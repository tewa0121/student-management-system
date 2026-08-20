const { pool } = require('../config/db');

const Settings = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM system_settings ORDER BY settingKey');
    return rows;
  },
  updateMany: async (settings) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const { settingKey, settingValue } of settings) {
        await connection.query(
          'UPDATE system_settings SET settingValue = ? WHERE settingKey = ?',
          [settingValue, settingKey]
        );
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = Settings;