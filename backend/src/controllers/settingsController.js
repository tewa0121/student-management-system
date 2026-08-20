// const Settings = require('../models/Settings');

// const getSettings = async (req, res, next) => {
//   try {
//     const settings = await Settings.getAll();
//     res.json(settings);
//   } catch (error) {
//     next(error);
//   }
// };

// const updateSettings = async (req, res, next) => {
//   try {
//     const { settings } = req.body;
//     if (!settings || !Array.isArray(settings)) {
//       return res.status(400).json({ message: 'Settings array required' });
//     }
//     await Settings.updateMany(settings);
//     res.json({ message: 'Settings updated successfully' });
//   } catch (error) {
//     console.error('Update settings error:', error);
//     res.status(500).json({ message: 'Failed to update settings', error: error.message });
//   }
// };

// module.exports = { getSettings, updateSettings };