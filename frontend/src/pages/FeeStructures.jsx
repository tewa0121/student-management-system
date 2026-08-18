import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/fee-structures';
const ACADEMIC_YEARS_API = 'http://localhost:5000/api/academic-years';
const CLASSES_API = 'http://localhost:5000/api/classes';
const CATEGORIES_API = 'http://localhost:5000/api/fee-categories'; // we'll create this endpoint

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Since we haven't created fee-categories endpoint yet, we'll use a hardcoded list (from seed)
const FEE_CATEGORIES = ['Tuition', 'Registration', 'Examination', 'Library', 'Transport', 'Laboratory', 'Uniform', 'Other'];

const FeeStructures = () => {
  const [structures, setStructures] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    academicYearId: '',
    classId: '',
    categoryId: '',
    amount: '',
    isOptional: false,
  });

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
  const fetchStructures = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      setStructures(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fee structures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchAcademicYears(), fetchClasses(), fetchStructures()]);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, getAuthHeader());
      setForm({ academicYearId: '', classId: '', categoryId: '', amount: '', isOptional: false });
      fetchStructures();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Create failed';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchStructures();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading fee structures...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Fee Structures</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select name="academicYearId" value={form.academicYearId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Academic Year</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select name="classId" value={form.classId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="categoryId" value={form.categoryId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Category</option>
          {FEE_CATEGORIES.map((cat, idx) => <option key={idx} value={idx+1}>{cat}</option>)}
        </select>
        <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required style={{ padding: 8, width: 120 }} />
        <label>
          <input type="checkbox" name="isOptional" checked={form.isOptional} onChange={handleChange} /> Optional
        </label>
        <button type="submit">Add Fee Structure</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Academic Year</th><th>Class</th><th>Category</th><th>Amount</th><th>Optional</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {structures.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{s.id}</td>
              <td>{s.academicYear}</td>
              <td>{s.className}</td>
              <td>{s.categoryName}</td>
              <td>${s.amount}</td>
              <td>{s.isOptional ? '✅' : '❌'}</td>
              <td>
                <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeeStructures;