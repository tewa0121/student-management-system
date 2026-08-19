import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EXAMS_API = 'http://localhost:5000/api/exams';
const STUDENTS_API = 'http://localhost:5000/api/students';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const ExamMarks = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(examId || '');
  const [examDetails, setExamDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all exams for dropdown
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(EXAMS_API, getAuthHeader());
        setExams(res.data);
        if (examId) {
          const exists = res.data.find(e => e.id === parseInt(examId));
          if (exists) setSelectedExamId(examId);
        }
      } catch (err) {
        console.error('Failed to fetch exams', err);
      }
    };
    fetchExams();
  }, [examId]);

  // When exam selection changes, load exam details and students
  useEffect(() => {
    if (!selectedExamId) {
      setExamDetails(null);
      setStudents([]);
      setResults({});
      return;
    }
    const loadData = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        // 1. Get exam details
        const examRes = await axios.get(`${EXAMS_API}/${selectedExamId}`, getAuthHeader());
        const exam = examRes.data;
        setExamDetails(exam);

        // 2. Fetch students for this class using the Students API
        // The students table has a 'class' column (string) – use the class name from exam
        const studentsRes = await axios.get(
          `${STUDENTS_API}?limit=1000&search=&class=${exam.className}`,
          getAuthHeader()
        );
        const studentList = studentsRes.data.students || [];

        // 3. Get existing results for this exam
        const resultRes = await axios.get(
          `${EXAMS_API}/${selectedExamId}/results`,
          getAuthHeader()
        );
        const existingResults = resultRes.data;

        // Build results map
        const resultMap = {};
        existingResults.forEach(r => {
          resultMap[r.studentId] = {
            marks: r.marksObtained,
            remarks: r.remarks || '',
          };
        });

        // Merge students with results
        const studentsWithResults = studentList.map(s => ({
          ...s,
          marks: resultMap[s.id]?.marks !== undefined ? resultMap[s.id].marks : '',
          remarks: resultMap[s.id]?.remarks || '',
        }));
        setStudents(studentsWithResults);
        setResults(resultMap);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedExamId]);

  // Update marks/remarks for a student
  const handleMarksChange = (studentId, field, value) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, [field]: value } : s
      )
    );
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedExamId) {
      setError('Please select an exam');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = students.map(s => ({
        studentId: s.id,
        marksObtained: s.marks !== '' ? parseFloat(s.marks) : 0,
        remarks: s.remarks || '',
      }));
      await axios.post(`${EXAMS_API}/${selectedExamId}/results`, { results: payload }, getAuthHeader());
      setSuccess('Marks saved successfully!');
      // Reload results to get auto-calculated grades
      setTimeout(async () => {
        const resultRes = await axios.get(`${EXAMS_API}/${selectedExamId}/results`, getAuthHeader());
        const existingResults = resultRes.data;
        const resultMap = {};
        existingResults.forEach(r => {
          resultMap[r.studentId] = {
            marks: r.marksObtained,
            remarks: r.remarks || '',
          };
        });
        setResults(resultMap);
        setStudents(prev =>
          prev.map(s => ({
            ...s,
            marks: resultMap[s.id]?.marks !== undefined ? resultMap[s.id].marks : s.marks,
            remarks: resultMap[s.id]?.remarks || s.remarks,
          }))
        );
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save marks');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // If no exam selected, show dropdown
  if (!selectedExamId) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Enter Marks</h1>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          style={{ padding: 8, width: 300 }}
        >
          <option value="">Select an Exam</option>
          {exams.map(e => (
            <option key={e.id} value={e.id}>{e.examTypeName} - {e.subjectName} ({e.className})</option>
          ))}
        </select>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error && !students.length) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Marks Entry</h1>
      {examDetails && (
        <p>
          <strong>Exam:</strong> {examDetails.name} ({examDetails.examTypeName})<br />
          <strong>Subject:</strong> {examDetails.subjectName}<br />
          <strong>Class:</strong> {examDetails.className}<br />
          <strong>Max Marks:</strong> {examDetails.maxMarks} | <strong>Passing:</strong> {examDetails.passingMarks}
        </p>
      )}

      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}

      <button onClick={() => setSelectedExamId('')} style={{ marginBottom: 20 }}>Change Exam</button>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Student ID</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Marks</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 8 }}>{s.studentId}</td>
              <td style={{ padding: 8 }}>{s.firstName} {s.lastName}</td>
              <td style={{ padding: 8 }}>
                <input
                  type="number"
                  step="0.5"
                  value={s.marks}
                  onChange={(e) => handleMarksChange(s.id, 'marks', e.target.value)}
                  style={{ width: 80, padding: 4 }}
                />
              </td>
              <td style={{ padding: 8 }}>
                <input
                  type="text"
                  value={s.remarks}
                  onChange={(e) => handleMarksChange(s.id, 'remarks', e.target.value)}
                  style={{ padding: 4 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: 20, padding: '8px 16px' }}
      >
        {saving ? 'Saving...' : 'Save All Marks'}
      </button>
    </div>
  );
};

export default ExamMarks;