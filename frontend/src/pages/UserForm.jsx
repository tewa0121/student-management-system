import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/users';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const UserForm = () => {
  const { id } = useParams(); // get id from URL if present
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
    isActive: true,
  });
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`${API_URL}/${id}`, getAuthHeader());
          const user = res.data;
          setForm({
            email: user.email,
            password: '', // don't prefill password
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            isActive: user.isActive,
          });
        } catch (err) {
          setError('Failed to load user data');
          console.error(err);
        }
      };
      fetchUser();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        // For update, we may not want to send password if empty
        const data = { ...form };
        if (!data.password) delete data.password;
        await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
      } else {
        await axios.post(API_URL, form, getAuthHeader());
      }
      navigate('/users');
    } catch (err) {
      const data = err.response?.data || {};
      setError(data.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', padding: 20 }}>
      <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
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
            placeholder={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={form.password}
            onChange={handleChange}
            required={!isEditing}
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
        {isEditing && (
          <div style={{ marginBottom: 10 }}>
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              /> Active
            </label>
          </div>
        )}
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;