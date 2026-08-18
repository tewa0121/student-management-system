import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PAYMENTS_API = 'http://localhost:5000/api/payments';
const INVOICES_API = 'http://localhost:5000/api/invoices';
const STUDENTS_API = 'http://localhost:5000/api/students';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ studentId: '', invoiceId: '' });
  const [form, setForm] = useState({
    invoiceId: '',
    studentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'Cash',
    referenceNumber: '',
    notes: '',
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${STUDENTS_API}?limit=1000`, getAuthHeader());
      setStudents(res.data.students || []);
    } catch (err) { console.error(err); }
  };
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(INVOICES_API, getAuthHeader());
      setInvoices(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchPayments = async () => {
    try {
      let url = PAYMENTS_API;
      const params = new URLSearchParams();
      if (filter.studentId) params.append('studentId', filter.studentId);
      if (filter.invoiceId) params.append('invoiceId', filter.invoiceId);
      if (params.toString()) url += '?' + params.toString();
      const res = await axios.get(url, getAuthHeader());
      setPayments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchStudents(), fetchInvoices(), fetchPayments()]);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(PAYMENTS_API, form, getAuthHeader());
      setForm({ invoiceId: '', studentId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], method: 'Cash', referenceNumber: '', notes: '' });
      fetchPayments();
      fetchInvoices(); // refresh invoices to update balances
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Record failed';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment? This will revert the invoice balance.')) return;
    try {
      await axios.delete(`${PAYMENTS_API}/${id}`, getAuthHeader());
      fetchPayments();
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Payments</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select name="studentId" value={filter.studentId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <select name="invoiceId" value={filter.invoiceId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All Invoices</option>
          {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber}</option>)}
        </select>
      </div>

      <h3>Record New Payment</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select name="invoiceId" value={form.invoiceId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Select Invoice</option>
          {invoices.filter(inv => inv.balance > 0).map(inv => (
            <option key={inv.id} value={inv.id}>{inv.invoiceNumber} (Balance: ${inv.balance})</option>
          ))}
        </select>
        <select name="studentId" value={form.studentId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <input type="number" step="0.01" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required style={{ padding: 8, width: 120 }} />
        <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required style={{ padding: 8 }} />
        <select name="method" value={form.method} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Card">Card</option>
          <option value="Mobile Payment">Mobile Payment</option>
          <option value="Other">Other</option>
        </select>
        <input name="referenceNumber" placeholder="Ref # (optional)" value={form.referenceNumber} onChange={handleChange} style={{ padding: 8 }} />
        <input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} style={{ padding: 8 }} />
        <button type="submit">Record Payment</button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Receipt #</th><th>Invoice</th><th>Student</th><th>Amount</th><th>Date</th><th>Method</th><th>Ref #</th><th>Received By</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{p.receiptNumber}</td>
              <td>{p.invoiceNumber}</td>
              <td>{p.firstName} {p.lastName}</td>
              <td>${p.amount}</td>
              <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
              <td>{p.method}</td>
              <td>{p.referenceNumber || '-'}</td>
              <td>{p.receivedByFirstName} {p.receivedByLastName}</td>
              <td>
                <button onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;