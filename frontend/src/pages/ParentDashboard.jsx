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
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState({ present: 0, absent: 0, total: 0 });
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [fees, setFees] = useState({ balance: 0, total: 0 });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch children
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await axios.get(`${API_URL}/students/parent/children`, getAuthHeader());
        setChildren(res.data);
        if (res.data.length > 0) {
          setSelectedChild(res.data[0]); // auto-select first child
        }
        setError('');
      } catch (err) {
        setError('Failed to load children – please contact admin.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  // Load data for selected child
  useEffect(() => {
    if (!selectedChild) return;
    const fetchChildData = async () => {
      setLoading(true);
      try {
        const childId = selectedChild.id;

        // Attendance
        const attRes = await axios.get(
          `${API_URL}/attendance/report/student?studentId=${childId}&startDate=2026-01-01&endDate=2026-12-31`,
          getAuthHeader()
        );
        const attRecords = attRes.data || [];
        const present = attRecords.filter(r => r.status === 'Present').length;
        const absent = attRecords.filter(r => r.status === 'Absent').length;
        setAttendance({ present, absent, total: attRecords.length });

        // Exams for the child's class
        const examsRes = await axios.get(
          `${API_URL}/exams?classId=${selectedChild.class}`,
          getAuthHeader()
        );
        const examList = examsRes.data || [];
        setExams(examList);

        // Grades (fetch results for each exam)
        const gradePromises = examList.map(async (exam) => {
          try {
            const res = await axios.get(`${API_URL}/exams/${exam.id}/results`, getAuthHeader());
            const result = res.data.find(r => r.studentId === childId);
            if (result) {
              return {
                subject: exam.subjectName,
                examName: exam.name || exam.examTypeName,
                marksObtained: result.marksObtained,
                maxMarks: exam.maxMarks,
                grade: result.grade,
                gpa: result.gpa,
              };
            }
            return null;
          } catch { return null; }
        });
        const gradeResults = await Promise.all(gradePromises);
        setGrades(gradeResults.filter(g => g !== null));

        // Fees
        const invoicesRes = await axios.get(
          `${API_URL}/invoices?studentId=${childId}`,
          getAuthHeader()
        );
        const invoices = invoicesRes.data || [];
        const balance = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
        const total = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        setFees({ balance, total });

        // Assignments
        const assignRes = await axios.get(
          `${API_URL}/assignments?classId=${selectedChild.class}&status=published`,
          getAuthHeader()
        );
        setAssignments(assignRes.data || []);

        setError('');
      } catch (err) {
        setError('Failed to load child data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, [selectedChild]);

  if (loading) return <div style={{ padding: 20 }}>Loading your children...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (children.length === 0) return <div style={{ padding: 20 }}>No children linked to your account.</div>;

  const child = selectedChild;
  const attendancePercentage = attendance.total > 0
    ? ((attendance.present / attendance.total) * 100).toFixed(1)
    : 'N/A';

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome, {user?.firstName}!</h1>
      <p style={{ color: '#666' }}>Parent Dashboard</p>

      {/* Child selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Select Child:</label>
        <select
          value={selectedChild?.id || ''}
          onChange={(e) => {
            const child = children.find(c => c.id === parseInt(e.target.value));
            setSelectedChild(child);
          }}
          style={{ padding: 8, width: 200 }}
        >
          {children.map(c => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
          ))}
        </select>
      </div>

      {child && (
        <>
          <h2>{child.firstName} {child.lastName} ({child.studentId})</h2>
          <p>Class: {child.class} | Section: {child.section || 'N/A'}</p>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
            <div style={{ padding: 15, background: '#e3f2fd', borderRadius: 8 }}>
              <h4>Attendance</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>{attendancePercentage}%</p>
              <small>{attendance.present} present / {attendance.total} days</small>
            </div>
            <div style={{ padding: 15, background: '#e8f5e9', borderRadius: 8 }}>
              <h4>Upcoming Exams</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>{exams.length}</p>
            </div>
            <div style={{ padding: 15, background: '#fff3e0', borderRadius: 8 }}>
              <h4>Fee Balance</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>${fees.balance.toFixed(2)}</p>
            </div>
            <div style={{ padding: 15, background: '#fce4ec', borderRadius: 8 }}>
              <h4>Assignments</h4>
              <p style={{ fontSize: 24, fontWeight: 'bold' }}>{assignments.length}</p>
            </div>
          </div>

          {/* Grades and Exams */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
              <h3>Grades</h3>
              {grades.length === 0 ? (
                <p>No grades available.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr><th>Subject</th><th>Marks</th><th>Grade</th></tr>
                  </thead>
                  <tbody>
                    {grades.map((g, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td>{g.subject}</td>
                        <td>{g.marksObtained}/{g.maxMarks}</td>
                        <td><strong>{g.grade}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
              <h3>Upcoming Exams</h3>
              {exams.length === 0 ? (
                <p>No upcoming exams.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {exams.slice(0, 5).map((exam, idx) => (
                    <li key={idx} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                      <strong>{exam.subjectName}</strong> – {exam.examTypeName}<br />
                      <small>{new Date(exam.date).toLocaleDateString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Assignments */}
          {assignments.length > 0 && (
            <div style={{ marginTop: 20, border: '1px solid #ddd', borderRadius: 8, padding: 15 }}>
              <h3>Current Assignments</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {assignments.map((a, idx) => (
                  <li key={idx} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                    <strong>{a.title}</strong> – due {new Date(a.deadline).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParentDashboard;