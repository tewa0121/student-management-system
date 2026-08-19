import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch children list on mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axios.get(`${API_URL}/parents/children`, getAuthHeader());
        setChildren(res.data);
        if (res.data.length > 0) {
          setSelectedChildId(res.data[0].id);
        }
      } catch (err) {
        setError('Failed to load children data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  // Fetch data for selected child
  useEffect(() => {
    if (!selectedChildId) {
      setChildData(null);
      return;
    }
    const fetchChildData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/parents/children/${selectedChildId}/dashboard`, getAuthHeader());
        setChildData(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load child data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, [selectedChildId]);

  if (loading && children.length === 0) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (children.length === 0) return <div style={{ padding: 20 }}>No children linked to this account.</div>;

  const child = children.find(c => c.id === parseInt(selectedChildId));
  const data = childData;

  return (
    <div style={{ padding: 20 }}>
      <h1>Parent Dashboard</h1>
      <p>Welcome, {user?.firstName}! Here is an overview of your children.</p>

      {/* Child Switcher */}
      <div style={{ marginBottom: 20 }}>
        <label>Select Child: </label>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
          style={{ padding: 8, marginLeft: 10 }}
        >
          {children.map(c => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.studentId})</option>
          ))}
        </select>
      </div>

      {loading && <div>Loading child data...</div>}
      {!loading && data && (
        <div>
          <h2>{data.student.firstName} {data.student.lastName}</h2>
          <p>Class: {data.student.class} | Section: {data.student.section || 'N/A'}</p>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
            <div style={{ padding: 15, background: '#e3f2fd', borderRadius: 8 }}>
              <h4>Attendance</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>
                {data.attendance.total > 0
                  ? ((data.attendance.present / data.attendance.total) * 100).toFixed(1) + '%'
                  : 'N/A'}
              </p>
              <small>{data.attendance.present} present / {data.attendance.total} days</small>
            </div>
            <div style={{ padding: 15, background: '#e8f5e9', borderRadius: 8 }}>
              <h4>Upcoming Exams</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>{data.upcomingExams?.length || 0}</p>
            </div>
            <div style={{ padding: 15, background: '#fff3e0', borderRadius: 8 }}>
              <h4>Fee Balance</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>${data.feeSummary?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div style={{ padding: 15, background: '#fce4ec', borderRadius: 8 }}>
              <h4>Assignments</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>{data.assignments?.length || 0}</p>
            </div>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Recent Grades */}
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
              <h3>Recent Grades</h3>
              {data.grades?.length === 0 ? (
                <p>No grades available.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.grades.slice(0, 5).map((g, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td>{g.subjectName}</td>
                        <td>{g.marksObtained}/{g.maxMarks}</td>
                        <td><strong>{g.grade}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Upcoming Exams */}
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
              <h3>Upcoming Exams</h3>
              {data.upcomingExams?.length === 0 ? (
                <p>No upcoming exams.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {data.upcomingExams.map((exam, idx) => (
                    <li key={idx} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      <strong>{exam.subjectName}</strong> – {exam.examTypeName} <br />
                      <small>{new Date(exam.date).toLocaleDateString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Timetable Preview */}
          {data.timetable && data.timetable.length > 0 && (
            <div style={{ marginTop: 20, border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
              <h3>Today's Timetable</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th>Subject</th><th>Time</th><th>Teacher</th><th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {data.timetable.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td>{t.subjectName}</td>
                      <td>{t.startTime} – {t.endTime}</td>
                      <td>{t.teacherFirstName} {t.teacherLastName}</td>
                      <td>{t.room || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;