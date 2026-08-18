import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/users';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const UserForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(API_URL, form, getAuthHeader());
      navigate('/users');
    } catch (err) {
      const data = err.response?.data || {};
      setError(data.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h2>Add New User</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;