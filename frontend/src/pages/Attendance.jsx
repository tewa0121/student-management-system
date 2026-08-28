// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/attendance';
// const CLASSES_API = 'http://localhost:5000/api/classes';
// const SECTIONS_API = 'http://localhost:5000/api/sections';

// const getAuthHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// });

// const Attendance = () => {
//   const [classes, setClasses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [selectedSection, setSelectedSection] = useState('');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [students, setStudents] = useState([]);
//   const [attendanceRecords, setAttendanceRecords] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const res = await axios.get(CLASSES_API, getAuthHeader());
//         setClasses(res.data);
//       } catch (err) { console.error(err); }
//     };
//     fetchClasses();
//   }, []);

//   useEffect(() => {
//     const fetchSections = async () => {
//       if (!selectedClass) { setSections([]); return; }
//       try {
//         const res = await axios.get(`${SECTIONS_API}?classId=${selectedClass}`, getAuthHeader());
//         setSections(res.data);
//       } catch (err) { console.error(err); }
//     };
//     fetchSections();
//   }, [selectedClass]);

//   const loadStudents = async () => {
//     if (!selectedClass) return;
//     setLoading(true);
//     setError('');
//     setMessage('');
//     try {
//       let url = `${API_URL}/students?classId=${selectedClass}`;
//       if (selectedSection) url += `&sectionId=${selectedSection}`;
//       console.log('🔄 Fetching students from:', url);
//       const res = await axios.get(url, getAuthHeader());
//       const studentList = res.data;
//       console.log('📋 Students received:', studentList);
//       setStudents(studentList);

//       if (studentList.length === 0) {
//         setMessage('No students found for this class/section combination.');
//       }

//       // Fetch existing attendance for that date
//       let attUrl = `${API_URL}?classId=${selectedClass}&date=${selectedDate}`;
//       if (selectedSection) attUrl += `&sectionId=${selectedSection}`;
//       const attRes = await axios.get(attUrl, getAuthHeader());
//       const existingAtt = attRes.data;
//       const map = {};
//       existingAtt.forEach(rec => {
//         map[rec.studentId] = { status: rec.status, note: rec.note || '' };
//       });
//       setAttendanceRecords(map);
//     } catch (err) {
//       console.error('❌ Error loading students:', err);
//       setError('Failed to load student data. Check console for details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reload when selection changes
//   useEffect(() => {
//     if (selectedClass && selectedDate) {
//       loadStudents();
//     } else {
//       setStudents([]);
//       setAttendanceRecords({});
//     }
//   }, [selectedClass, selectedSection, selectedDate]);

//   const handleStatusChange = (studentId, status) => {
//     setAttendanceRecords(prev => ({
//       ...prev,
//       [studentId]: { ...(prev[studentId] || {}), status }
//     }));
//   };

//   const handleNoteChange = (studentId, note) => {
//     setAttendanceRecords(prev => ({
//       ...prev,
//       [studentId]: { ...(prev[studentId] || {}), note }
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const records = students.map(s => {
//       const rec = attendanceRecords[s.id] || { status: 'Present', note: '' };
//       return {
//         studentId: s.id,
//         status: rec.status || 'Present',
//         note: rec.note || ''
//       };
//     });
//     const payload = {
//       classId: selectedClass,
//       sectionId: selectedSection || null,
//       date: selectedDate,
//       records
//     };
//     setSaving(true);
//     setMessage('');
//     setError('');
//     try {
//       await axios.post(API_URL, payload, getAuthHeader());
//       setMessage('Attendance saved successfully!');
//       loadStudents(); // refresh
//     } catch (err) {
//       const data = err.response?.data || {};
//       const msg = data.sqlMessage || data.message || data.error || 'Save failed';
//       setError(msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Mark Attendance</h1>

//       <form onSubmit={handleSubmit}>
//         <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
//           <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required style={{ padding: 8 }}>
//             <option value="">Select Class</option>
//             {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//           </select>
//           <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ padding: 8 }}>
//             <option value="">All Sections</option>
//             {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//           </select>
//           <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required style={{ padding: 8 }} />
//           <button type="button" onClick={loadStudents} disabled={loading}>Load Students</button>
//         </div>

//         {loading && <div>Loading students...</div>}
//         {error && <div style={{ color: 'red' }}>{error}</div>}
//         {message && <div style={{ color: message.includes('No students') ? 'orange' : 'green' }}>{message}</div>}

//         {students.length > 0 && (
//           <div>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#f0f0f0' }}>
//                   <th>Student</th>
//                   <th>Status</th>
//                   <th>Note</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {students.map(s => {
//                   const rec = attendanceRecords[s.id] || { status: 'Present', note: '' };
//                   const statusValue = rec.status || 'Present';
//                   const noteValue = rec.note || '';
//                   return (
//                     <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
//                       <td>{s.firstName} {s.lastName} ({s.studentId})</td>
//                       <td>
//                         <select
//                           value={statusValue}
//                           onChange={(e) => handleStatusChange(s.id, e.target.value)}
//                           style={{ padding: 4 }}
//                         >
//                           <option value="Present">Present</option>
//                           <option value="Absent">Absent</option>
//                           <option value="Late">Late</option>
//                           <option value="Excused">Excused</option>
//                           <option value="Half-day">Half-day</option>
//                         </select>
//                       </td>
//                       <td>
//                         <input
//                           type="text"
//                           placeholder="Note"
//                           value={noteValue}
//                           onChange={(e) => handleNoteChange(s.id, e.target.value)}
//                           style={{ padding: 4, width: '100%' }}
//                         />
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//             <button type="submit" disabled={saving} style={{ marginTop: 20, padding: '8px 16px' }}>
//               {saving ? 'Saving...' : 'Save Attendance'}
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default Attendance;