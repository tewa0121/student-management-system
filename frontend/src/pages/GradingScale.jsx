import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/grade-scale';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const GradingScale = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ grade: '', minMarks: '', maxMarks: '', gpa: '', description: '' });

  const fetchGrades = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      setGrades(res.data);
    } catch (err) {
      setError('Failed to load grade scale');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrades(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (grade) => {
    setForm({
      grade: grade.grade,
      minMarks: grade.minMarks,
      maxMarks: grade.maxMarks,
      gpa: grade.gpa,
      description: grade.description || '',
    });
    setEditingId(grade.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, getAuthHeader());
      } else {
        await axios.post(API_URL, form, getAuthHeader());
      }
      setForm({ grade: '', minMarks: '', maxMarks: '', gpa: '', description: '' });
      setEditingId(null);
      fetchGrades();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchGrades();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading grading scale...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Grading Scale</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>{editingId ? 'Edit Grade' : 'Add New Grade'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          <input name="grade" placeholder="Grade (e.g., A+)" value={form.grade} onChange={handleChange} required />
          <input name="minMarks" type="number" placeholder="Min Marks" value={form.minMarks} onChange={handleChange} required />
          <input name="maxMarks" type="number" placeholder="Max Marks" value={form.maxMarks} onChange={handleChange} required />
          <input name="gpa" type="number" step="0.01" placeholder="GPA" value={form.gpa} onChange={handleChange} required />
        </div>
        <input name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} style={{ width: '100%', marginTop: 10 }} />
        <button type="submit" style={{ marginTop: 10 }}>{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ grade: '', minMarks: '', maxMarks: '', gpa: '', description: '' }); }} style={{ marginLeft: 10 }}>Cancel</button>}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Grade</th><th>Min</th><th>Max</th><th>GPA</th><th>Description</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(g => (
            <tr key={g.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td><strong>{g.grade}</strong></td>
              <td>{g.minMarks}</td>
              <td>{g.maxMarks}</td>
              <td>{parseFloat(g.gpa).toFixed(2)}</td>
              <td>{g.description || '-'}</td>
              <td>
                <button onClick={() => handleEdit(g)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(g.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradingScale;