import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isParent = user?.role === 'parent';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [];

    const dashPath = isStudent ? '/student-dashboard' : isParent ? '/parent-dashboard' : '/dashboard';
    items.push({ label: '📊 Dashboard', path: dashPath });

    if (isAdmin) {
      items.push(
        { label: '👨‍🎓 Students', path: '/students' },
        { label: '📤 Bulk Import/Export', path: '/bulk-import-export' },
        { label: '👨‍🏫 Teachers', path: '/teachers' },
        { label: '📚 Classes', path: '/classes' },
        { label: '📋 Attendance', path: '/attendance' },
        { label: '📝 Exams', path: '/exams' },
        { label: '📊 Grading Scale', path: '/grading-scale' },
        { label: '✏️ Marks Entry', path: '/exam-marks' },
        { label: '💰 Fees', path: '/fee-structures' },
        { label: '📖 Library', path: '/library/books' },
        { label: '⏰ Timetable', path: '/timetable' },
        { label: '📄 Assignments', path: '/assignments' },
        { label: '📊 Report Card', path: '/report-card' },
        { label: '🆔 ID Cards', path: '/id-cards' },
        { label: '📢 Announcements', path: '/announcements' },
        { label: '👥 Users', path: '/users' },
        // === NEW: Audit Logs ===
        { label: '📋 Audit Logs', path: '/audit-logs' },
      );
    }

    if (isStudent) {
      items.push(
        { label: '📋 My Attendance', path: '/student-attendance' },
        { label: '📊 My Grades', path: '/student-grades' },
        { label: '💰 My Fees', path: '/student-fees' },
      );
    }

    if (isParent) {
      items.push({ label: '👨‍👩‍👧‍👦 My Children', path: '/parent-dashboard' });
    }

    items.push(
      { label: '🔔 Notifications', path: '/notifications' },
      { label: '⚙️ Settings', path: '/settings' },
    );

    return items;
  };

  const menuItems = getMenuItems();
  const sidebarWidth = collapsed ? 70 : 240;

  return (
    <div
      style={{
        width: sidebarWidth,
        height: '100vh',
        background: '#2c3e50',
        color: '#ecf0f1',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 15px',
          borderBottom: '1px solid #34495e',
          textAlign: 'center',
          fontSize: '1.2rem',
          whiteSpace: 'nowrap',
        }}
      >
        {collapsed ? '📚' : <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>School Manager</span>}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: '10px', overflowY: 'auto' }}>
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              color: '#ecf0f1',
              textDecoration: 'none',
              transition: 'background 0.2s',
              gap: '12px',
              whiteSpace: 'nowrap',
              background: isActive(item.path) ? '#34495e' : 'transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.2rem', minWidth: '24px' }}>{item.label.split(' ')[0]}</span>
            {!collapsed && <span style={{ fontSize: '0.95rem' }}>{item.label.slice(2)}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '15px 0', borderTop: '1px solid #34495e' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'none',
            border: 'none',
            color: '#ecf0f1',
            padding: '12px 20px',
            width: '100%',
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '1.2rem', minWidth: '24px' }}>🚪</span>
          {!collapsed && <span style={{ fontSize: '0.95rem' }}>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '5px',
          background: 'transparent',
          border: 'none',
          color: '#ecf0f1',
          fontSize: '1rem',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
        }}
      >
        {collapsed ? '→' : '←'}
      </button>
    </div>
  );
};

export default Sidebar;