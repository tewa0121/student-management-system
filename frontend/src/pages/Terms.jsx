import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/terms';
const ACADEMIC_YEARS_URL = 'http://localhost:5000/api/academic-years';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Terms = () => {
  const [terms, setTerms] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [form, setForm] = useState({
    academicYearId: '',
    name: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });

  const fetchYears = async () => {
    try {
      const res = await axios.get(ACADEMIC_YEARS_URL, getAuthHeader());
      setYears(res.data);
    } catch (err) {
      console.error('Failed to fetch years', err);
    }
  };

  const fetchTerms = async () => {
    try {
      const url = selectedYear ? `${API_URL}?academicYearId=${selectedYear}` : API_URL;
      const res = await axios.get(url, getAuthHeader());
      setTerms(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch terms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [selectedYear]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, getAuthHeader());
      setForm({ academicYearId: '', name: '', startDate: '', endDate: '', isActive: false });
      fetchTerms();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this term?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchTerms();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSetActive = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/active`, {}, getAuthHeader());
      fetchTerms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set active');
    }
  };

  if (loading) return <div>Loading terms...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Terms</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Filter by Academic Year: </label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Years</option>
          {years.map(y => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="academicYearId" value={form.academicYearId} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }}>
          <option value="">Select Academic Year</option>
          {years.map(y => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>
        <input name="name" placeholder="Term Name (e.g., Term 1)" value={form.name} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }} />
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }} />
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }} />
        <label>
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
        </label>
        <button type="submit">Add Term</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Academic Year</th><th>Name</th><th>Start</th><th>End</th><th>Active</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {terms.map(t => {
            const yearName = years.find(y => y.id === t.academicYearId)?.name || 'Unknown';
            return (
              <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{t.id}</td>
                <td>{yearName}</td>
                <td>{t.name}</td>
                <td>{new Date(t.startDate).toLocaleDateString()}</td>
                <td>{new Date(t.endDate).toLocaleDateString()}</td>
                <td>{t.isActive ? '✅' : '❌'}</td>
                <td>
                  <button onClick={() => handleSetActive(t.id)}>Set Active</button>
                  <button onClick={() => handleDelete(t.id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Terms;