import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SECTIONS_API = 'http://localhost:5000/api/sections';
const CLASSES_API = 'http://localhost:5000/api/classes';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [form, setForm] = useState({
    classId: '',
    name: '',
    teacherId: '',
    capacity: '',
  });

  const fetchClasses = async () => {
    try {
      const res = await axios.get(CLASSES_API, getAuthHeader());
      setClasses(res.data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const fetchSections = async () => {
    try {
      const url = filterClass ? `${SECTIONS_API}?classId=${filterClass}` : SECTIONS_API;
      const res = await axios.get(url, getAuthHeader());
      setSections(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchSections();
  }, [filterClass]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(SECTIONS_API, form, getAuthHeader());
      setForm({ classId: '', name: '', teacherId: '', capacity: '' });
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await axios.delete(`${SECTIONS_API}/${id}`, getAuthHeader());
      fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading sections...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Sections</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Filter by Class: </label>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select name="classId" value={form.classId} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }}>
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="name" placeholder="Section Name (e.g., A)" value={form.name} onChange={handleChange} required style={{ padding: 8, marginRight: 8 }} />
        <input name="teacherId" placeholder="Teacher ID (optional)" value={form.teacherId} onChange={handleChange} style={{ padding: 8, marginRight: 8 }} />
        <input name="capacity" placeholder="Capacity" type="number" value={form.capacity} onChange={handleChange} style={{ padding: 8, marginRight: 8 }} />
        <button type="submit">Add Section</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Class</th><th>Section Name</th><th>Teacher ID</th><th>Capacity</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(s => {
            const className = classes.find(c => c.id === s.classId)?.name || 'Unknown';
            return (
              <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{s.id}</td>
                <td>{className}</td>
                <td>{s.name}</td>
                <td>{s.teacherId || '-'}</td>
                <td>{s.capacity}</td>
                <td>
                  <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Sections;