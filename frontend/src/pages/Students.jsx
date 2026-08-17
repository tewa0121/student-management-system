import React, { useState, useEffect } from 'react';
import { getStudents, deleteStudent, getClasses, getSections } from '../api/students';
import { useNavigate } from 'react-router-dom';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents(page, 10, search, classFilter, sectionFilter, statusFilter);
      setStudents(res.data.students);
      setTotalPages(res.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [classRes, sectionRes] = await Promise.all([
        getClasses(),
        getSections()
      ]);
      setClasses(classRes.data);
      setSections(sectionRes.data.filter(s => s));
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, classFilter, sectionFilter, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (id) => {
    navigate(`/students/${id}/edit`);
  };

  const handleAdd = () => {
    navigate('/students/new');
  };

  if (loading && students.length === 0) return <div>Loading students...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Student Management</h1>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search name, ID, admission..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 250 }}
        />
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Sections</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
          <option value="Transferred">Transferred</option>
          <option value="Suspended">Suspended</option>
          <option value="Withdrawn">Withdrawn</option>
          <option value="Expelled">Expelled</option>
        </select>
        <button onClick={handleAdd} style={{ padding: '8px 16px' }}>+ Add Student</button>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Student ID</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Class</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Section</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{s.id}</td>
              <td style={{ padding: 10 }}>{s.studentId}</td>
              <td style={{ padding: 10 }}>{s.firstName} {s.lastName}</td>
              <td style={{ padding: 10 }}>{s.class}</td>
              <td style={{ padding: 10 }}>{s.section}</td>
              <td style={{ padding: 10 }}>
                <span style={{ color: s.status === 'Active' ? 'green' : 'red' }}>
                  {s.status}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                <button onClick={() => handleEdit(s.id)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span style={{ margin: '0 15px' }}>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Students;