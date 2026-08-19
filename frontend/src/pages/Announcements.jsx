import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/announcements';
const CLASSES_API = 'http://localhost:5000/api/classes';
const SECTIONS_API = 'http://localhost:5000/api/sections';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    audience: 'everyone',
    classId: '',
    sectionId: '',
    publishDate: '',
    expirationDate: '',
    attachment: '',
  });

  const fetchData = async () => {
    try {
      const [annRes, classRes] = await Promise.all([
        axios.get(API_URL, getAuthHeader()),
        axios.get(CLASSES_API, getAuthHeader()),
      ]);
      setAnnouncements(annRes.data);
      setClasses(classRes.data);
    } catch (err) {
      setError('Failed to load announcements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Fetch sections when class changes
  useEffect(() => {
    if (form.classId) {
      axios.get(`${SECTIONS_API}?classId=${form.classId}`, getAuthHeader())
        .then(res => setSections(res.data))
        .catch(err => console.error(err));
    } else {
      setSections([]);
    }
  }, [form.classId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.audience !== 'specific') {
        delete payload.classId;
        delete payload.sectionId;
      }
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, getAuthHeader());
      } else {
        await axios.post(API_URL, payload, getAuthHeader());
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', content: '', priority: 'normal', audience: 'everyone', classId: '', sectionId: '', publishDate: '', expirationDate: '', attachment: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      content: item.content,
      priority: item.priority,
      audience: item.audience,
      classId: item.classId || '',
      sectionId: item.sectionId || '',
      publishDate: item.publishDate?.split('T')[0] || '',
      expirationDate: item.expirationDate?.split('T')[0] || '',
      attachment: item.attachment || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading announcements...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const priorityColors = {
    normal: '#28a745',
    important: '#ffc107',
    urgent: '#dc3545'
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Announcements</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} style={{ padding: '8px 16px' }}>
          {showForm ? 'Cancel' : '+ New Announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>{editingId ? 'Edit' : 'New'} Announcement</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} rows={4} required />
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
            <select name="audience" value={form.audience} onChange={handleChange}>
              <option value="everyone">Everyone</option>
              <option value="teachers">Teachers</option>
              <option value="students">Students</option>
              <option value="parents">Parents</option>
              <option value="staff">Staff</option>
              <option value="specific">Specific Class</option>
            </select>
            {form.audience === 'specific' && (
              <>
                <select name="classId" value={form.classId} onChange={handleChange}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="sectionId" value={form.sectionId} onChange={handleChange}>
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </>
            )}
            <input type="date" name="publishDate" value={form.publishDate} onChange={handleChange} />
            <input type="date" name="expirationDate" value={form.expirationDate} onChange={handleChange} />
            <input name="attachment" placeholder="Attachment URL" value={form.attachment} onChange={handleChange} />
          </div>
          <button type="submit" style={{ marginTop: 10 }}>{editingId ? 'Update' : 'Create'}</button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Title</th><th>Content</th><th>Priority</th><th>Audience</th><th>Publish Date</th><th>Expires</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td><strong>{a.title}</strong></td>
              <td>{a.content.substring(0, 60)}...</td>
              <td><span style={{ background: priorityColors[a.priority], color: '#fff', padding: '2px 8px', borderRadius: 4 }}>{a.priority}</span></td>
              <td>{a.audience}</td>
              <td>{new Date(a.publishDate).toLocaleDateString()}</td>
              <td>{a.expirationDate ? new Date(a.expirationDate).toLocaleDateString() : '-'}</td>
              <td>
                <button onClick={() => handleEdit(a)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(a.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Announcements;