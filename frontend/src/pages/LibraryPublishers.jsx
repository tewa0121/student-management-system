import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/library/publishers';
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const LibraryPublishers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' });

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      setItems(res.data);
    } catch (err) {
      setError('Failed to load publishers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, getAuthHeader());
      } else {
        await axios.post(API_URL, form, getAuthHeader());
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', address: '', phone: '', email: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, address: item.address || '', phone: item.phone || '', email: item.email || '' });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this publisher?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading publishers...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Library Publishers</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} style={{ padding: '8px 16px' }}>
          {showForm ? 'Cancel' : '+ Add Publisher'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>{editingId ? 'Edit Publisher' : 'Add New Publisher'}</h3>
          <input name="name" placeholder="Publisher Name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginBottom: 10 }} />
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 10 }} />
          <button type="submit">{editingId ? 'Update' : 'Save'}</button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>Name</th><th>Address</th><th>Phone</th><th>Email</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.address}</td>
              <td>{item.phone}</td>
              <td>{item.email}</td>
              <td>
                <button onClick={() => handleEdit(item)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(item.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LibraryPublishers;