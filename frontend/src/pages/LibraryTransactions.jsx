import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/library';
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const LibraryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bookId: '',
    studentId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [transRes, booksRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/transactions`, getAuthHeader()),
        axios.get(`${API_URL}/books`, getAuthHeader()),
        axios.get('http://localhost:5000/api/students?limit=1000', getAuthHeader()),
      ]);
      setTransactions(transRes.data);
      setBooks(booksRes.data);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/transactions/issue`, form, getAuthHeader());
      setForm({ bookId: '', studentId: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', notes: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Issue failed';
      alert(msg);
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Confirm return?')) return;
    try {
      await axios.put(`${API_URL}/transactions/${id}/return`, {}, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Return failed');
    }
  };

  if (loading) return <div>Loading transactions...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Library Transactions</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px' }}>
          {showForm ? 'Cancel' : '+ Issue Book'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleIssue} style={{ marginBottom: 20, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Issue Book</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select name="bookId" value={form.bookId} onChange={handleChange} required>
              <option value="">Select Book</option>
              {books.filter(b => b.availableCopies > 0).map(b => (
                <option key={b.id} value={b.id}>{b.title} (Available: {b.availableCopies})</option>
              ))}
            </select>
            <select name="studentId" value={form.studentId} onChange={handleChange} required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}
            </select>
            <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required />
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
            <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
          </div>
          <button type="submit" style={{ marginTop: 10 }}>Issue Book</button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Book</th><th>Student</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Fine</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{t.bookTitle}</td>
              <td>{t.firstName} {t.lastName}</td>
              <td>{new Date(t.issueDate).toLocaleDateString()}</td>
              <td>{new Date(t.dueDate).toLocaleDateString()}</td>
              <td>{t.returnDate ? new Date(t.returnDate).toLocaleDateString() : '-'}</td>
              <td><span style={{ color: t.status === 'Issued' ? 'orange' : t.status === 'Returned' ? 'green' : 'red' }}>{t.status}</span></td>
              <td>${t.fine || 0}</td>
              <td>
                {t.status === 'Issued' && (
                  <button onClick={() => handleReturn(t.id)} style={{ color: 'green' }}>Return</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LibraryTransactions;