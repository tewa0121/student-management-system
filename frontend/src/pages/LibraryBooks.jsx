import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/library';
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const LibraryBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    isbn: '',
    title: '',
    authorId: '',
    categoryId: '',
    publisherId: '',
    publicationYear: '',
    edition: '',
    pages: '',
    description: '',
    shelfLocation: '',
    totalCopies: 1,
  });

  const fetchData = async () => {
    try {
      const [booksRes, catsRes, authorsRes, pubsRes] = await Promise.all([
        axios.get(`${API_URL}/books`, getAuthHeader()),
        axios.get(`${API_URL}/categories`, getAuthHeader()),
        axios.get(`${API_URL}/authors`, getAuthHeader()),
        axios.get(`${API_URL}/publishers`, getAuthHeader()),
      ]);
      setBooks(booksRes.data);
      setCategories(catsRes.data);
      setAuthors(authorsRes.data);
      setPublishers(pubsRes.data);
    } catch (err) {
      setError('Failed to load library data');
      console.error(err);
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
      const payload = {
        ...form,
        totalCopies: parseInt(form.totalCopies) || 1,
        pages: parseInt(form.pages) || 0,
      };
      if (editingId) {
        await axios.put(`${API_URL}/books/${editingId}`, payload, getAuthHeader());
      } else {
        await axios.post(`${API_URL}/books`, payload, getAuthHeader());
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ isbn: '', title: '', authorId: '', categoryId: '', publisherId: '', publicationYear: '', edition: '', pages: '', description: '', shelfLocation: '', totalCopies: 1 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (book) => {
    setForm({
      isbn: book.isbn || '',
      title: book.title,
      authorId: book.authorId,
      categoryId: book.categoryId,
      publisherId: book.publisherId || '',
      publicationYear: book.publicationYear || '',
      edition: book.edition || '',
      pages: book.pages || '',
      description: book.description || '',
      shelfLocation: book.shelfLocation || '',
      totalCopies: book.totalCopies || 1,
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await axios.delete(`${API_URL}/books/${id}`, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading library...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Library Books</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} style={{ padding: '8px 16px' }}>
          {showForm ? 'Cancel' : '+ Add Book'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>{editingId ? 'Edit Book' : 'Add New Book'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleChange} />
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <select name="authorId" value={form.authorId} onChange={handleChange} required>
              <option value="">Select Author</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select name="publisherId" value={form.publisherId} onChange={handleChange}>
              <option value="">Select Publisher</option>
              {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input name="publicationYear" placeholder="Publication Year" value={form.publicationYear} onChange={handleChange} />
            <input name="edition" placeholder="Edition" value={form.edition} onChange={handleChange} />
            <input name="pages" type="number" placeholder="Pages" value={form.pages} onChange={handleChange} />
            <input name="shelfLocation" placeholder="Shelf Location" value={form.shelfLocation} onChange={handleChange} />
            <input name="totalCopies" type="number" placeholder="Total Copies" value={form.totalCopies} onChange={handleChange} required />
          </div>
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={2} style={{ width: '100%', marginTop: 10 }} />
          <button type="submit" style={{ marginTop: 10 }}>{editingId ? 'Update' : 'Save'}</button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>ID</th><th>ISBN</th><th>Title</th><th>Author</th><th>Category</th><th>Copies</th><th>Available</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(b => (
            <tr key={b.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{b.id}</td>
              <td>{b.isbn}</td>
              <td>{b.title}</td>
              <td>{b.authorName}</td>
              <td>{b.categoryName}</td>
              <td>{b.totalCopies}</td>
              <td>{b.availableCopies}</td>
              <td>
                <button onClick={() => handleEdit(b)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(b.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LibraryBooks;