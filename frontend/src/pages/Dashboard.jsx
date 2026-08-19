import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api/reports';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard-stats`, getAuthHeader());
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  // 使用空对象作为后备，防止 stats 为 null
  const safeStats = stats || {};

  // 辅助函数：安全地将值转换为带两位小数的金额字符串
  const formatCurrency = (value) => {
    // 1. 将值转换为数字，如果转换失败则默认为 0
    const num = Number(value);
    // 2. 检查是否为有效数字，如果是则格式化为两位小数，否则返回 '0.00'
    return !isNaN(num) ? num.toFixed(2) : '0.00';
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.firstName || 'User'}!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
        <div style={{ padding: 15, background: '#e3f2fd', borderRadius: 8 }}>
          <h3>Total Students</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{safeStats.totalStudents || 0}</p>
        </div>
        <div style={{ padding: 15, background: '#e8f5e9', borderRadius: 8 }}>
          <h3>Total Teachers</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{safeStats.totalTeachers || 0}</p>
        </div>
        <div style={{ padding: 15, background: '#fff3e0', borderRadius: 8 }}>
          <h3>Total Classes</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{safeStats.totalClasses || 0}</p>
        </div>
        <div style={{ padding: 15, background: '#fce4ec', borderRadius: 8 }}>
          <h3>Attendance Today</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{safeStats.attendanceToday || 0}</p>
        </div>
        <div style={{ padding: 15, background: '#e0f7fa', borderRadius: 8 }}>
          <h3>Outstanding Fees</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>${formatCurrency(safeStats.outstandingFees)}</p>
        </div>
        <div style={{ padding: 15, background: '#f3e5f5', borderRadius: 8 }}>
          <h3>Fees Collected (Month)</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>${formatCurrency(safeStats.feesCollected)}</p>
        </div>
        <div style={{ padding: 15, background: '#efebe9', borderRadius: 8 }}>
          <h3>Upcoming Exams</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{safeStats.upcomingExams || 0}</p>
        </div>
        <div style={{ padding: 15, background: '#ede7f6', borderRadius: 8 }}>
          <h3>Upcoming Events</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{safeStats.upcomingEvents || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;