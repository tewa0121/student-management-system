// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/assignments';
// const CLASSES_API = 'http://localhost:5000/api/classes';
// const SUBJECTS_API = 'http://localhost:5000/api/subjects';
// const USERS_API = 'http://localhost:5000/api/users';

// const getAuthHeader = () => ({
//   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
// });

// const Assignments = () => {
//   const [assignments, setAssignments] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [form, setForm] = useState({
//     classId: '',
//     subjectId: '',
//     teacherId: '',
//     title: '',
//     description: '',
//     deadline: '',
//     maxScore: 100,
//     status: 'draft',
//   });

//   const fetchClasses = async () => {
//     try {
//       const res = await axios.get(CLASSES_API, getAuthHeader());
//       setClasses(res.data);
//     } catch (err) { console.error(err); }
//   };
//   const fetchSubjects = async () => {
//     try {
//       const res = await axios.get(SUBJECTS_API, getAuthHeader());
//       setSubjects(res.data);
//     } catch (err) { console.error(err); }
//   };
//   const fetchTeachers = async () => {
//     try {
//       const res = await axios.get(`${USERS_API}?role=teacher`, getAuthHeader());
//       setTeachers(res.data.users || []);
//     } catch (err) { console.error(err); }
//   };
//   const fetchAssignments = async () => {
//     try {
//       const res = await axios.get(API_URL, getAuthHeader());
//       setAssignments(res.data);
//       setError('');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch assignments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     Promise.all([fetchClasses(), fetchSubjects(), fetchTeachers(), fetchAssignments()]);
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post(API_URL, form, getAuthHeader());
//       setForm({ classId: '', subjectId: '', teacherId: '', title: '', description: '', deadline: '', maxScore: 100, status: 'draft' });
//       fetchAssignments();
//     } catch (err) {
//       const data = err.response?.data || {};
//       const msg = data.sqlMessage || data.message || data.error || 'Create failed';
//       alert(msg);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this assignment?')) return;
//     try {
//       await axios.delete(`${API_URL}/${id}`, getAuthHeader());
//       fetchAssignments();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Delete failed');
//     }
//   };

//   if (loading) return <div>Loading assignments...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Assignments</h1>

//       <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
//         <select name="classId" value={form.classId} onChange={handleChange} required style={{ padding: 8 }}>
//           <option value="">Class</option>
//           {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//         </select>
//         <select name="subjectId" value={form.subjectId} onChange={handleChange} required style={{ padding: 8 }}>
//           <option value="">Subject</option>
//           {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//         </select>
//         <select name="teacherId" value={form.teacherId} onChange={handleChange} required style={{ padding: 8 }}>
//           <option value="">Teacher</option>
//           {teachers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
//         </select>
//         <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={{ padding: 8 }} />
//         <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ padding: 8 }} />
//         <input type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange} required style={{ padding: 8 }} />
//         <input type="number" name="maxScore" placeholder="Max Score" value={form.maxScore} onChange={handleChange} style={{ padding: 8, width: 100 }} />
//         <select name="status" value={form.status} onChange={handleChange} style={{ padding: 8 }}>
//           <option value="draft">Draft</option>
//           <option value="published">Published</option>
//           <option value="closed">Closed</option>
//         </select>
//         <button type="submit">Create Assignment</button>
//       </form>

//       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//         <thead>
//           <tr style={{ background: '#f0f0f0' }}>
//             <th>ID</th><th>Title</th><th>Class</th><th>Subject</th><th>Teacher</th><th>Deadline</th><th>Status</th><th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {assignments.map(a => (
//             <tr key={a.id} style={{ borderBottom: '1px solid #ddd' }}>
//               <td>{a.id}</td>
//               <td>{a.title}</td>
//               <td>{a.className}</td>
//               <td>{a.subjectName}</td>
//               <td>{a.teacherFirstName} {a.teacherLastName}</td>
//               <td>{new Date(a.deadline).toLocaleString()}</td>
//               <td>{a.status}</td>
//               <td>
//                 <button onClick={() => handleDelete(a.id)} style={{ color: 'red' }}>Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Assignments;