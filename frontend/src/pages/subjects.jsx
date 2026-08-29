// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const SUBJECTS_API = 'http://localhost:5000/api/subjects';
// const CLASSES_API = 'http://localhost:5000/api/classes';

// const getAuthHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// });

// const Subjects = () => {
//   const [subjects, setSubjects] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [filterClass, setFilterClass] = useState('');
//   const [form, setForm] = useState({
//     code: '',
//     name: '',
//     description: '',
//     classId: '',
//     creditHours: '',
//     maxMarks: 100,
//     passingMarks: 40,
//     isElective: false,
//   });

//   const fetchClasses = async () => {
//     try {
//       const res = await axios.get(CLASSES_API, getAuthHeader());
//       setClasses(res.data);
//     } catch (err) {
//       console.error('Failed to fetch classes', err);
//     }
//   };

//   const fetchSubjects = async () => {
//     try {
//       const url = filterClass ? `${SUBJECTS_API}?classId=${filterClass}` : SUBJECTS_API;
//       const res = await axios.get(url, getAuthHeader());
//       setSubjects(res.data);
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch subjects');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   useEffect(() => {
//     fetchSubjects();
//   }, [filterClass]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(SUBJECTS_API, form, getAuthHeader());
//       setForm({ code: '', name: '', description: '', classId: '', creditHours: '', maxMarks: 100, passingMarks: 40, isElective: false });
//       fetchSubjects();
//     } catch (err) {
//       const data = err.response?.data || {};
//       const msg = data.sqlMessage || data.message || data.error || 'Create failed';
//       alert(msg);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this subject?')) return;
//     try {
//       await axios.delete(`${SUBJECTS_API}/${id}`, getAuthHeader());
//       fetchSubjects();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Delete failed');
//     }
//   };

//   if (loading) return <div>Loading subjects...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Subjects</h1>

//       <div style={{ marginBottom: 20 }}>
//         <label>Filter by Class: </label>
//         <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ padding: 8 }}>
//           <option value="">All Classes</option>
//           {classes.map(c => (
//             <option key={c.id} value={c.id}>{c.name}</option>
//           ))}
//         </select>
//       </div>

//       <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//         <input name="code" placeholder="Code (e.g., MATH101)" value={form.code} onChange={handleChange} required style={{ padding: 8 }} />
//         <input name="name" placeholder="Subject Name" value={form.name} onChange={handleChange} required style={{ padding: 8 }} />
//         <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ padding: 8 }} />
//         <select name="classId" value={form.classId} onChange={handleChange} style={{ padding: 8 }}>
//           <option value="">No class (global)</option>
//           {classes.map(c => (
//             <option key={c.id} value={c.id}>{c.name}</option>
//           ))}
//         </select>
//         <input name="creditHours" placeholder="Credit Hours" type="number" value={form.creditHours} onChange={handleChange} style={{ padding: 8 }} />
//         <input name="maxMarks" placeholder="Max Marks" type="number" value={form.maxMarks} onChange={handleChange} style={{ padding: 8 }} />
//         <input name="passingMarks" placeholder="Passing Marks" type="number" value={form.passingMarks} onChange={handleChange} style={{ padding: 8 }} />
//         <label>
//           <input type="checkbox" name="isElective" checked={form.isElective} onChange={handleChange} /> Elective
//         </label>
//         <button type="submit">Add Subject</button>
//       </form>

//       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr style={{ background: '#f0f0f0' }}>
//             <th>ID</th><th>Code</th><th>Name</th><th>Class</th><th>Credit</th><th>Max</th><th>Pass</th><th>Elective</th><th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {subjects.map(s => {
//             const className = classes.find(c => c.id === s.classId)?.name || 'Global';
//             return (
//               <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
//                 <td>{s.id}</td>
//                 <td>{s.code}</td>
//                 <td>{s.name}</td>
//                 <td>{className}</td>
//                 <td>{s.creditHours}</td>
//                 <td>{s.maxMarks}</td>
//                 <td>{s.passingMarks}</td>
//                 <td>{s.isElective ? '✅' : '❌'}</td>
//                 <td>
//                   <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Subjects;