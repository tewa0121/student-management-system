import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TIMETABLE_API = 'http://localhost:5000/api/timetable';
const CLASSES_API = 'http://localhost:5000/api/classes';
const SECTIONS_API = 'http://localhost:5000/api/sections';
const ACADEMIC_YEARS_API = 'http://localhost:5000/api/academic-years';
const SUBJECTS_API = 'http://localhost:5000/api/subjects';
const USERS_API = 'http://localhost:5000/api/users';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PERIODS = [
  { start: '08:00', end: '08:45' },
  { start: '08:50', end: '09:35' },
  { start: '09:40', end: '10:25' },
  { start: '10:30', end: '11:15' },
  { start: '11:20', end: '12:05' },
  { start: '13:00', end: '13:45' },
  { start: '13:50', end: '14:35' },
  { start: '14:40', end: '15:25' },
];

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ classId: '', sectionId: '', academicYearId: '' });
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    academicYearId: '',
    termId: '',
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '08:45',
    subjectId: '',
    teacherId: '',
    room: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch dependencies
  const fetchClasses = async () => {
    try {
      const res = await axios.get(CLASSES_API, getAuthHeader());
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchSections = async (classId) => {
    if (!classId) { setSections([]); return; }
    try {
      const res = await axios.get(`${SECTIONS_API}?classId=${classId}`, getAuthHeader());
      setSections(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get(ACADEMIC_YEARS_API, getAuthHeader());
      setAcademicYears(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(SUBJECTS_API, getAuthHeader());
      setSubjects(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${USERS_API}?role=teacher`, getAuthHeader());
      setTeachers(res.data.users || []);
    } catch (err) { console.error(err); }
  };

  const fetchTimetable = async () => {
    try {
      let url = TIMETABLE_API;
      const params = new URLSearchParams();
      if (filters.classId) params.append('classId', filters.classId);
      if (filters.sectionId) params.append('sectionId', filters.sectionId);
      if (filters.academicYearId) params.append('academicYearId', filters.academicYearId);
      if (params.toString()) url += '?' + params.toString();
      const res = await axios.get(url, getAuthHeader());
      setTimetable(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchClasses(), fetchAcademicYears(), fetchSubjects(), fetchTeachers()]);
  }, []);

  useEffect(() => {
    if (filters.classId) fetchSections(filters.classId);
    else setSections([]);
  }, [filters.classId]);

  useEffect(() => {
    fetchTimetable();
  }, [filters]);

  // Build grid: [day][period] -> entry
  const getGrid = () => {
    const grid = {};
    DAYS.forEach(day => {
      grid[day] = {};
      PERIODS.forEach((period, idx) => {
        grid[day][idx] = null;
      });
    });
    timetable.forEach(entry => {
      const day = entry.dayOfWeek;
      const start = entry.startTime;
      const end = entry.endTime;
      // Find matching period index by start time
      const idx = PERIODS.findIndex(p => p.start === start);
      if (idx !== -1) {
        grid[day][idx] = entry;
      }
    });
    return grid;
  };

  const grid = getGrid();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({
      classId: '',
      sectionId: '',
      academicYearId: '',
      termId: '',
      dayOfWeek: 'Monday',
      startTime: '08:00',
      endTime: '08:45',
      subjectId: '',
      teacherId: '',
      room: '',
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${TIMETABLE_API}/${editingId}`, form, getAuthHeader());
      } else {
        await axios.post(TIMETABLE_API, form, getAuthHeader());
      }
      resetForm();
      fetchTimetable();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.sqlMessage || data.message || data.error || 'Save failed';
      alert(msg);
    }
  };

  const handleEdit = (entry) => {
    setForm({
      classId: entry.classId,
      sectionId: entry.sectionId || '',
      academicYearId: entry.academicYearId,
      termId: entry.termId || '',
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      room: entry.room || '',
    });
    setEditingId(entry.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await axios.delete(`${TIMETABLE_API}/${id}`, getAuthHeader());
      fetchTimetable();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading timetable...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Timetable</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select name="classId" value={filters.classId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="sectionId" value={filters.sectionId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">All Sections</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="academicYearId" value={filters.academicYearId} onChange={handleFilterChange} style={{ padding: 8 }}>
          <option value="">Academic Year</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>

      <h3>{editingId ? 'Edit' : 'Add'} Timetable Entry</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select name="classId" value={form.classId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="sectionId" value={form.sectionId} onChange={handleChange} style={{ padding: 8 }}>
          <option value="">Section (optional)</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="academicYearId" value={form.academicYearId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Academic Year</option>
          {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} required style={{ padding: 8 }}>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select name="startTime" value={form.startTime} onChange={handleChange} required style={{ padding: 8 }}>
          {PERIODS.map(p => <option key={p.start} value={p.start}>{p.start}</option>)}
        </select>
        <select name="endTime" value={form.endTime} onChange={handleChange} required style={{ padding: 8 }}>
          {PERIODS.map(p => <option key={p.end} value={p.end}>{p.end}</option>)}
        </select>
        <select name="subjectId" value={form.subjectId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select name="teacherId" value={form.teacherId} onChange={handleChange} required style={{ padding: 8 }}>
          <option value="">Teacher</option>
          {teachers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
        </select>
        <input name="room" placeholder="Room" value={form.room} onChange={handleChange} style={{ padding: 8 }} />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>Timetable Grid</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>Period</th>
              {DAYS.map(day => <th key={day} style={{ border: '1px solid #ccc', padding: 8 }}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{period.start} - {period.end}</td>
                {DAYS.map(day => {
                  const entry = grid[day]?.[idx] || null;
                  return (
                    <td key={day} style={{ border: '1px solid #ccc', padding: 8, minWidth: 120 }}>
                      {entry ? (
                        <div>
                          <div><strong>{entry.subjectName}</strong></div>
                          <div>{entry.teacherFirstName} {entry.teacherLastName}</div>
                          <div>{entry.room || ''}</div>
                          <div>
                            <button onClick={() => handleEdit(entry)} style={{ fontSize: 12 }}>Edit</button>
                            <button onClick={() => handleDelete(entry.id)} style={{ fontSize: 12, color: 'red' }}>Del</button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;