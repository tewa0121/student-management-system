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
    const interval = setInterval(fetchUnread, 30000);
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
    flexWrap: 'wrap',
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

  // Role‑based navigation
  const isAdmin = user.role === 'super_admin' || user.role === 'admin';
  const isStudent = user.role === 'student';
  const isParent = user.role === 'parent';

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Common links for all roles */}
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/notifications" style={linkStyle}>
          Notifications
          {unread > 0 && <span style={badgeStyle}>{unread}</span>}
        </Link>
        <Link to="/announcements" style={linkStyle}>Announcements</Link>

        {/* Admin links */}
        {isAdmin && (
          <>
            <Link to="/students" style={linkStyle}>Students</Link>
            <Link to="/teachers" style={linkStyle}>Teachers</Link>
            <Link to="/classes" style={linkStyle}>Classes</Link>
            <Link to="/attendance" style={linkStyle}>Attendance</Link>
            <Link to="/exams" style={linkStyle}>Exams</Link>
            <Link to="/exam-marks" style={linkStyle}>Marks</Link>
            <Link to="/fees" style={linkStyle}>Fees</Link>
            <Link to="/library/books" style={linkStyle}>Library</Link>
            <Link to="/report-card" style={linkStyle}>Report Card</Link>
            <Link to="/users" style={linkStyle}>Users</Link>
          </>
        )}

        {/* Student links */}
        {isStudent && (
          <>
            <Link to="/student-dashboard" style={linkStyle}>My Dashboard</Link>
            <Link to="/student-attendance" style={linkStyle}>My Attendance</Link>
            <Link to="/student-grades" style={linkStyle}>My Grades</Link>
            <Link to="/student-fees" style={linkStyle}>My Fees</Link>
          </>
        )}

        {/* Parent links */}
        {isParent && (
          <>
            <Link to="/parent-dashboard" style={linkStyle}>My Children</Link>
            {/* Other parent links will be added after parent portal is built */}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 15 }}>
          Welcome, {user.firstName} ({user.role})
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            padding: '5px 12px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;