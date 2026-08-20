import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Fix: assign fonts correctly
pdfMake.vfs = pdfFonts.vfs;

const STUDENTS_API = 'http://localhost:5000/api/students';
const EXAMS_API = 'http://localhost:5000/api/exams';
const ATTENDANCE_API = 'http://localhost:5000/api/attendance';
const ACADEMIC_YEARS_API = 'http://localhost:5000/api/academic-years';
const TERMS_API = 'http://localhost:5000/api/terms';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const ReportCard = () => {
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${STUDENTS_API}?limit=1000`, getAuthHeader());
        setStudents(res.data.students || []);
      } catch (err) { console.error(err); }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get(ACADEMIC_YEARS_API, getAuthHeader());
        setAcademicYears(res.data);
      } catch (err) { console.error(err); }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) { setTerms([]); return; }
    const fetchTerms = async () => {
      try {
        const res = await axios.get(`${TERMS_API}?academicYearId=${selectedYear}`, getAuthHeader());
        setTerms(res.data);
      } catch (err) { console.error(err); }
    };
    fetchTerms();
  }, [selectedYear]);

  const generateReport = async () => {
    if (!selectedStudent || !selectedYear) {
      setError('Please select a student and academic year.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch student details
      const studentRes = await axios.get(`${STUDENTS_API}/${selectedStudent}`, getAuthHeader());
      const student = studentRes.data;

      // Fetch exams for that class
      const examsRes = await axios.get(EXAMS_API, getAuthHeader());
      const relevantExams = examsRes.data.filter(e => e.className === student.class);

      // Fetch results
      const results = [];
      for (const exam of relevantExams) {
        try {
          const resultRes = await axios.get(`${EXAMS_API}/${exam.id}/results`, getAuthHeader());
          const studentResult = resultRes.data.find(r => r.studentId === parseInt(selectedStudent));
          if (studentResult) {
            results.push({
              examName: exam.name || exam.subjectName,
              subject: exam.subjectName,
              marksObtained: studentResult.marksObtained,
              maxMarks: exam.maxMarks,
              grade: studentResult.grade,
              gpa: studentResult.gpa,
            });
          }
        } catch { /* ignore */ }
      }

      // Fetch attendance
      const attRes = await axios.get(
        `${ATTENDANCE_API}/report/student?studentId=${selectedStudent}&startDate=2026-01-01&endDate=2026-12-31`,
        getAuthHeader()
      );
      const records = attRes.data || [];
      const present = records.filter(r => r.status === 'Present').length;
      const absent = records.filter(r => r.status === 'Absent').length;
      const total = records.length;
      const attendancePercentage = total ? ((present / total) * 100).toFixed(1) : 'N/A';

      let totalGpa = 0;
      results.forEach(r => totalGpa += (r.gpa || 0));
      const avgGpa = results.length ? (totalGpa / results.length).toFixed(2) : 'N/A';

      const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        content: [
          { text: 'STUDENT REPORT CARD', style: 'header', alignment: 'center' },
          { text: `Academic Year: ${academicYears.find(y => y.id === parseInt(selectedYear))?.name || ''}`, style: 'subheader', alignment: 'center' },
          { text: '___________________________________', alignment: 'center' },
          { text: ' ', margin: [0, 10] },
          {
            columns: [
              {
                width: '70%',
                text: [
                  { text: 'Student Name: ', bold: true }, `${student.firstName} ${student.lastName}\n`,
                  { text: 'Student ID: ', bold: true }, `${student.studentId}\n`,
                  { text: 'Class: ', bold: true }, `${student.class || 'N/A'}\n`,
                  { text: 'Section: ', bold: true }, `${student.section || 'N/A'}\n`,
                ]
              },
              { width: '30%', text: '' }
            ]
          },
          { text: ' ', margin: [0, 10] },
          {
            style: 'tableExample',
            table: {
              widths: ['*', '*', '*', '*', '*'],
              body: [
                [{ text: 'Subject', style: 'tableHeader' }, { text: 'Exam', style: 'tableHeader' }, { text: 'Marks', style: 'tableHeader' }, { text: 'Grade', style: 'tableHeader' }, { text: 'GPA', style: 'tableHeader' }],
                ...results.map(r => [r.subject, r.examName, `${r.marksObtained}/${r.maxMarks}`, r.grade || 'F', r.gpa || '0.0']),
                [{ text: 'TOTAL GPA', colSpan: 4, alignment: 'right', bold: true }, {}, {}, {}, { text: avgGpa, bold: true }]
              ]
            }
          },
          { text: ' ', margin: [0, 10] },
          {
            columns: [
              {
                width: '50%',
                text: [
                  { text: 'Attendance Summary:\n', bold: true },
                  `Present: ${present}\n`,
                  `Absent: ${absent}\n`,
                  `Total Days: ${total}\n`,
                  `Percentage: ${attendancePercentage}%`
                ]
              },
              { width: '50%', text: '' }
            ]
          },
          { text: ' ', margin: [0, 20] },
          { text: 'Teacher Remarks: _________________________________', margin: [0, 5] },
          { text: 'Principal Signature: ______________________________', margin: [0, 5] },
          { text: ' ', margin: [0, 10] },
          { text: 'Generated on: ' + new Date().toLocaleDateString(), alignment: 'right', fontSize: 8, color: 'gray' }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 14, bold: true, color: '#333' },
          tableExample: { margin: [0, 5, 0, 15] },
          tableHeader: { bold: true, fontSize: 12, color: 'black', fillColor: '#e0e0e0' }
        }
      };

      pdfMake.createPdf(docDefinition).download(`report-card-${student.studentId}.pdf`);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to generate report card. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Generate Report Card</h1>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label>Student:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
            ))}
          </select>
        </div>
        <div>
          <label>Academic Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Select Year</option>
            {academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Term (optional):</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">All Terms</option>
            {terms.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={generateReport}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          background: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        {loading ? 'Generating...' : 'Generate PDF'}
      </button>
    </div>
  );
};

export default ReportCard;