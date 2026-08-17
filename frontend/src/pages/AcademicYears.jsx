import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/academic-years';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const AcademicYears = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isActive: false });

  const fetchYears = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      setYears(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, getAuthHeader());
      setForm({ name: '', startDate: '', endDate: '', isActive: false });
      fetchYears();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this academic year?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchYears();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetActive = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/active`, {}, getAuthHeader());
      fetchYears();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set active');
    }
  };

  if (loading) return <div>Loading academic years...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Academic Years</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input name="name" placeholder="Name (e.g. 2026/2027)" value={form.name} onChange={handleChange} required />
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
        <label>
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
        </label>
        <button type="submit">Add Year</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>ID</th><th>Name</th><th>Start</th><th>End</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {years.map(y => (
            <tr key={y.id}>
              <td>{y.id}</td>
              <td>{y.name}</td>
              <td>{y.startDate}</td>
              <td>{y.endDate}</td>
              <td>{y.isActive ? '✅' : '❌'}</td>
              <td>
                <button onClick={() => handleSetActive(y.id)}>Set Active</button>
                <button onClick={() => handleDelete(y.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcademicYears;