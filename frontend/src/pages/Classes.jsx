import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/classes';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', capacity: '' });

  const fetchClasses = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      setClasses(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, getAuthHeader());
      setForm({ name: '', description: '', capacity: '' });
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading classes...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Classes</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input name="name" placeholder="Class Name (e.g., Grade 10)" value={form.name} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ padding: 8, marginRight: 8 }} />
        <input name="capacity" placeholder="Capacity" type="number" value={form.capacity} onChange={handleChange} style={{ padding: 8, marginRight: 8 }} />
        <button type="submit">Add Class</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Name</th><th>Description</th><th>Capacity</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.description}</td>
              <td>{c.capacity}</td>
              <td>
                <button onClick={() => handleDelete(c.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Classes;