import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/exams';
const CLASSES_API = 'http://localhost:5000/api/classes';
const SUBJECTS_API = 'http://localhost:5000/api/subjects';
const EXAM_TYPES_API = 'http://localhost:5000/api/exam-types'; // we haven't built this, but we'll add a quick endpoint

// For now, we'll use a hardcoded list of exam types, but we can add a fetch later.
const EXAM_TYPES = ['Midterm', 'Final', 'Quiz', 'Monthly Test', 'Mock Exam'];

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ classId: '', subjectId: '' });
  const [form, setForm] = useState({
    examTypeId: '',
    classId: '',
    subjectId: '',
    name: '',
    date: '',
    maxMarks: 100,
    passingMarks: 40,
    description: '',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(CLASSES_API, getAuthHeader());
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(SUBJECTS_API, getAuthHeader());
      setSubjects(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchExams = async () => {
    try {
      let url = API_URL;
      const params = new URLSearchParams();
      if (filter.classId) params.append('classId', filter.classId);
      if (filter.subjectId) params.append('subjectId', filter.subjectId);
      if (params.toString()) url += '?' + params.toString();
      const res = await axios.get(url, getAuthHeader());
      setExams(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchClasses(), fetchSubjects()]);
  }, []);

  useEffect(() => {
    fetchExams();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({
      examTypeId: '',
      classId: '',
      subjectId: '',
      name: '',
      date: '',
      maxMarks: 100,
      passingMarks: 40,
      description: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, getAuthHeader());
      } else {
        await axios.post(API_URL, form, getAuthHeader());
      }
      resetForm();
      fetchExams();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Save failed';
      alert(msg);
    }
  };

  const handleEdit = (exam) => {
    setForm({
      examTypeId: exam.examTypeId,
      classId: exam.classId,
      subjectId: exam.subjectId,
      name: exam.name,
      date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks,
      description: exam.description || '',
    });
    setEditingId(exam.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading exams...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Exams</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Filter by Class: </label>
        <select name="classId" value={filter.classId} onChange={handleFilterChange} style={{ padding: 8, marginRight: 10 }}>
          <option value="">All</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label>Filter by Subject: </label>
        <select name="subjectId" value={filter.subjectId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select name="examTypeId" value={form.examTypeId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Exam Type</option>
          {EXAM_TYPES.map((type, idx) => <option key={idx} value={idx+1}>{type}</option>)}
        </select>
        <select name="classId" value={form.classId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="subjectId" value={form.subjectId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input name="name" placeholder="Exam Name" value={form.name} onChange={handleChange} required style={{ padding: 8 }} />
        <input type="date" name="date" value={form.date} onChange={handleChange} required style={{ padding: 8 }} />
        <input type="number" name="maxMarks" placeholder="Max Marks" value={form.maxMarks} onChange={handleChange} style={{ padding: 8, width: 100 }} />
        <input type="number" name="passingMarks" placeholder="Passing" value={form.passingMarks} onChange={handleChange} style={{ padding: 8, width: 100 }} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ padding: 8 }} />
        <button type="submit">{editingId ? 'Update' : 'Create'} Exam</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Type</th><th>Class</th><th>Subject</th><th>Name</th><th>Date</th><th>Max</th><th>Pass</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{e.id}</td>
              <td>{e.examTypeName}</td>
              <td>{e.className}</td>
              <td>{e.subjectName}</td>
              <td>{e.name}</td>
              <td>{new Date(e.date).toLocaleDateString()}</td>
              <td>{e.maxMarks}</td>
              <td>{e.passingMarks}</td>
              <td>
                <button onClick={() => handleEdit(e)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(e.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Exams;