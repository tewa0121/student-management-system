import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" style={{ padding: '8px 16px' }}>Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
};

export default Register;