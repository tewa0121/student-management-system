import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const res = await axios.get('http://localhost:5000/api/notifications/unread', getAuthHeader());
        setUnread(res.data.unread || 0);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navStyle = {
    background: '#2c3e50',
    color: '#fff',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const linkStyle = { color: '#fff', textDecoration: 'none', margin: '0 10px' };
  const badgeStyle = {
    background: 'red',
    color: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
    marginLeft: '5px',
  };

  if (!user) return null;

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/students" style={linkStyle}>Students</Link>
        <Link to="/teachers" style={linkStyle}>Teachers</Link>
        <Link to="/classes" style={linkStyle}>Classes</Link>
        <Link to="/attendance" style={linkStyle}>Attendance</Link>
        <Link to="/exams" style={linkStyle}>Exams</Link>
        <Link to="/fees" style={linkStyle}>Fees</Link>
        <Link to="/library/books" style={linkStyle}>Library</Link>
        <Link to="/announcements" style={linkStyle}>Announcements</Link>
        <Link to="/notifications" style={linkStyle}>
          Notifications
          {unread > 0 && <span style={badgeStyle}>{unread}</span>}
        </Link>
        {user.role === 'super_admin' || user.role === 'admin' ? (
          <Link to="/users" style={linkStyle}>Users</Link>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 15 }}>Welcome, {user.firstName} ({user.role})</span>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;