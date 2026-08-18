import React, { useState, useEffect } from 'react';
import axios from 'axios';

const INVOICES_API = 'http://localhost:5000/api/invoices';
const STUDENTS_API = 'http://localhost:5000/api/students';
const ACADEMIC_YEARS_API = 'http://localhost:5000/api/academic-years';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ studentId: '', academicYearId: '', status: '' });
  const [generateForm, setGenerateForm] = useState({
    studentId: '',
    academicYearId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${STUDENTS_API}?limit=1000`, getAuthHeader());
      setStudents(res.data.students || []);
    } catch (err) { console.error(err); }
  };
  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get(ACADEMIC_YEARS_API, getAuthHeader());
      setAcademicYears(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchInvoices = async () => {
    try {
      let url = INVOICES_API;
      const params = new URLSearchParams();
      if (filter.studentId) params.append('studentId', filter.studentId);
      if (filter.academicYearId) params.append('academicYearId', filter.academicYearId);
      if (filter.status) params.append('status', filter.status);
      if (params.toString()) url += '?' + params.toString();
      const res = await axios.get(url, getAuthHeader());
      setInvoices(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchStudents(), fetchAcademicYears(), fetchInvoices()]);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleGenerateChange = (e) => {
    setGenerateForm({ ...generateForm, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${INVOICES_API}/generate`, generateForm, getAuthHeader());
      setGenerateForm({
        studentId: '',
        academicYearId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchInvoices();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Generation failed';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await axios.delete(`${INVOICES_API}/${id}`, getAuthHeader());
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading invoices...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Invoices</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select name="studentId" value={filter.studentId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <select name="academicYearId" value={filter.academicYearId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All Academic Years</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select name="status" value={filter.status} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All Status</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <h3>Generate New Invoice</h3>
      <form onSubmit={handleGenerate} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select name="studentId" value={generateForm.studentId} onChange={handleGenerateChange} required style={{ padding: 8 }}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}
        </select>
        <select name="academicYearId" value={generateForm.academicYearId} onChange={handleGenerateChange} required style={{ padding: 8 }}>
          <option value="">Select Academic Year</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <input type="date" name="issueDate" value={generateForm.issueDate} onChange={handleGenerateChange} required style={{ padding: 8 }} />
        <input type="date" name="dueDate" value={generateForm.dueDate} onChange={handleGenerateChange} required style={{ padding: 8 }} />
        <button type="submit">Generate Invoice</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Invoice #</th><th>Student</th><th>Academic Year</th><th>Issue Date</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.firstName} {inv.lastName}</td>
              <td>{inv.academicYearName}</td>
              <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
              <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td>${inv.totalAmount}</td>
              <td>${inv.paidAmount}</td>
              <td>${inv.balance}</td>
              <td>{inv.status}</td>
              <td>
                <button onClick={() => handleDelete(inv.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;