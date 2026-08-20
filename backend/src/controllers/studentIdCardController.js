// const QRCode = require('qrcode');
// const { pool } = require('../config/db');

// // Generate ID card data (student info + QR code)
// const getStudentIdCard = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     // Get student details
//     const [rows] = await pool.query(
//       `SELECT s.*, u.email 
//        FROM students s 
//        LEFT JOIN users u ON s.userId = u.id 
//        WHERE s.id = ?`,
//       [id]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'Student not found' });
//     }
//     const student = rows[0];

//     // Generate QR code (data: student ID + some verification)
//     const qrData = JSON.stringify({
//       studentId: student.studentId,
//       name: `${student.firstName} ${student.lastName}`,
//       class: student.class,
//     });
//     const qrCode = await QRCode.toDataURL(qrData, {
//       errorCorrectionLevel: 'H',
//       margin: 1,
//       width: 200,
//     });

//     // Get school settings (for logo/name)
//     const [settings] = await pool.query(
//       "SELECT settingKey, settingValue FROM system_settings WHERE settingKey IN ('school_name', 'school_logo')"
//     );
//     const settingsObj = {};
//     settings.forEach(s => { settingsObj[s.settingKey] = s.settingValue; });

//     res.json({
//       student: {
//         id: student.id,
//         studentId: student.studentId,
//         firstName: student.firstName,
//         lastName: student.lastName,
//         class: student.class,
//         section: student.section,
//         rollNo: student.rollNo,
//         // we don't have a photo field yet – use placeholder
//         photo: null, // later we can add a photo upload
//       },
//       qrCode,
//       schoolName: settingsObj.school_name || 'My School',
//       schoolLogo: settingsObj.school_logo || null,
//     });
//   } catch (error) {
//     console.error('ID card error:', error);
//     res.status(500).json({ message: 'Failed to generate ID card data', error: error.message });
//   }
// };

// module.exports = { getStudentIdCard };