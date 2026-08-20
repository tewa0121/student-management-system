import React, { useState, useEffect } from 'react';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.vfs;

const STUDENTS_API = 'http://localhost:5000/api/students';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const StudentIdCard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${STUDENTS_API}?limit=1000`, getAuthHeader());
        setStudents(res.data.students || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, []);

  const handleGenerate = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${STUDENTS_API}/${selectedStudent}/id-card`, getAuthHeader());
      setCardData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate ID card');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!cardData) return;
    const { student, qrCode, schoolName } = cardData;
    const fullName = `${student.firstName} ${student.lastName}`;

    const docDefinition = {
      pageSize: { width: 85 * 2.83465, height: 55 * 2.83465 }, // ~85x55mm
      pageMargins: [10, 10, 10, 10],
      content: [
        {
          columns: [
            // Left: photo placeholder + name
            {
              width: '30%',
              stack: [
                // Placeholder for photo
                { 
                  canvas: [
                    { type: 'rect', x: 0, y: 0, w: 70, h: 70, r: 5, lineColor: '#ccc', color: '#f0f0f0' }
                  ],
                  alignment: 'center',
                },
                { text: fullName, style: 'name', alignment: 'center', margin: [0, 4, 0, 0] },
                { text: student.studentId, style: 'id', alignment: 'center' },
              ]
            },
            // Right: details + QR
            {
              width: '70%',
              stack: [
                { text: schoolName, style: 'school', alignment: 'center' },
                { text: 'STUDENT ID CARD', style: 'title', alignment: 'center' },
                { text: `Class: ${student.class || 'N/A'}  |  Section: ${student.section || 'N/A'}`, style: 'details' },
                { text: `Roll No: ${student.rollNo || 'N/A'}`, style: 'details' },
                { 
                  columns: [
                    { width: '*', text: '' },
                    { width: 60, image: qrCode, fit: [60, 60] },
                    { width: '*', text: '' }
                  ]
                }
              ]
            }
          ]
        }
      ],
      styles: {
        school: { fontSize: 10, bold: true, color: '#2c3e50' },
        title: { fontSize: 12, bold: true, color: '#2980b9', margin: [0, 2, 0, 4] },
        name: { fontSize: 11, bold: true },
        id: { fontSize: 9, color: '#555' },
        details: { fontSize: 9, margin: [0, 2, 0, 2] },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    pdfMake.createPdf(docDefinition).download(`id-card-${student.studentId}.pdf`);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Student ID Card Generator</h1>
      <div style={{ marginBottom: 20 }}>
        <label>Select Student: </label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          style={{ padding: 8, width: '80%' }}
        >
          <option value="">-- Choose --</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
          ))}
        </select>
      </div>
      <button onClick={handleGenerate} disabled={loading} style={{ padding: '8px 16px' }}>
        {loading ? 'Generating...' : 'Generate ID Card'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

      {cardData && (
        <div style={{ marginTop: 20, padding: 15, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Preview</h3>
          <div style={{ 
            background: '#fff', 
            padding: 10, 
            width: '85mm', 
            border: '1px solid #333',
            borderRadius: 4
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ textAlign: 'center', width: '30%' }}>
                <div style={{ 
                  width: 70, height: 70, 
                  background: '#f0f0f0', 
                  borderRadius: 4,
                  margin: '0 auto'
                }}>
                  {/* placeholder for photo */}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 11, marginTop: 4 }}>
                  {cardData.student.firstName} {cardData.student.lastName}
                </div>
                <div style={{ fontSize: 9, color: '#555' }}>{cardData.student.studentId}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 10, textAlign: 'center' }}>
                  {cardData.schoolName}
                </div>
                <div style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#2980b9' }}>
                  STUDENT ID CARD
                </div>
                <div style={{ fontSize: 9, marginTop: 4 }}>
                  Class: {cardData.student.class || 'N/A'} | Section: {cardData.student.section || 'N/A'}
                </div>
                <div style={{ fontSize: 9 }}>Roll No: {cardData.student.rollNo || 'N/A'}</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  <img src={cardData.qrCode} alt="QR" style={{ width: 50, height: 50 }} />
                </div>
              </div>
            </div>
          </div>
          <button onClick={downloadPDF} style={{ marginTop: 10, padding: '8px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 4 }}>
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentIdCard;