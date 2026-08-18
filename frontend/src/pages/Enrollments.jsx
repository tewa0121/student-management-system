import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/enrollments';
const STUDENTS_API = 'http://localhost:5000/api/students';
const ACADEMIC_YEARS_API = 'http://localhost:5000/api/academic-years';
const CLASSES_API = 'http://localhost:5000/api/classes';
const SECTIONS_API = 'http://localhost:5000/api/sections';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ academicYearId: '', classId: '' });
  const [form, setForm] = useState({
    studentId: '',
    academicYearId: '',
    classId: '',
    sectionId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${STUDENTS_API}?limit=1000`, getAuthHeader());
      setStudents(res.data.students || []);
    } catch (err) { console.error(err); }
  };
  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get(ACADEMIC_YEARS_API, getAuthHeader());
      setAcademicYears(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchClasses = async () => {
    try {
      const res = await axios.get(CLASSES_API, getAuthHeader());
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchSections = async (classId) => {
    if (!classId) { setSections([]); return; }
    try {
      const res = await axios.get(`${SECTIONS_API}?classId=${classId}`, getAuthHeader());
      setSections(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchEnrollments = async () => {
    try {
      let url = API_URL;
      const params = new URLSearchParams();
      if (filter.academicYearId) params.append('academicYearId', filter.academicYearId);
      if (filter.classId) params.append('classId', filter.classId);
      if (params.toString()) url += '?' + params.toString();
      const res = await axios.get(url, getAuthHeader());
      setEnrollments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchStudents(), fetchAcademicYears(), fetchClasses()]);
  }, []);

  useEffect(() => {
    if (form.classId) fetchSections(form.classId);
    else setSections([]);
  }, [form.classId]);

  useEffect(() => {
    fetchEnrollments();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, getAuthHeader());
      setForm({ studentId: '', academicYearId: '', classId: '', sectionId: '', enrollmentDate: new Date().toISOString().split('T')[0], status: 'Active' });
      fetchEnrollments();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Create failed';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enrollment?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading enrollments...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Enrollments</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Filter by Academic Year: </label>
        <select name="academicYearId" value={filter.academicYearId} onChange={handleFilterChange} style={{ padding: 8, marginRight: 10 }}>
          <option value="">All</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <label>Filter by Class: </label>
        <select name="classId" value={filter.classId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select name="studentId" value={form.studentId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}
        </select>
        <select name="academicYearId" value={form.academicYearId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Select Academic Year</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select name="classId" value={form.classId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="sectionId" value={form.sectionId} onChange={handleChange} style={{ padding: 8 }}>
          <option value="">Select Section (optional)</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" name="enrollmentDate" value={form.enrollmentDate} onChange={handleChange} required style={{ padding: 8 }} />
        <select name="status" value={form.status} onChange={handleChange} style={{ padding: 8 }}>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Dropped">Dropped</option>
          <option value="Transferred">Transferred</option>
        </select>
        <button type="submit">Enroll Student</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Student</th><th>Academic Year</th><th>Class</th><th>Section</th><th>Date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{e.id}</td>
              <td>{e.firstName} {e.lastName} ({e.studentId})</td>
              <td>{e.academicYearName}</td>
              <td>{e.className}</td>
              <td>{e.sectionName || '-'}</td>
              <td>{new Date(e.enrollmentDate).toLocaleDateString()}</td>
              <td>{e.status}</td>
              <td>
                <button onClick={() => handleDelete(e.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Enrollments;