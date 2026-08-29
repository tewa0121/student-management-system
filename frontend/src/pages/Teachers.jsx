import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/users';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // optional: filter by active/inactive

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // Fetch users with role=teacher
      const res = await axios.get(
        `${API_URL}?page=${page}&limit=10&search=${search}&role=teacher${statusFilter ? `&isActive=${statusFilter}` : ''}`,
        getAuthHeader()
      );
      setTeachers(res.data.users);
      setTotalPages(res.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, search, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/${id}/edit`);
  };

  const handleAdd = () => {
    // Navigate to user form; user can select "teacher" role
    navigate('/users/new');
  };

  if (loading && teachers.length === 0) return <div>Loading teachers...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Teacher Management</h1>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 250 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={handleAdd} style={{ padding: '8px 16px' }}>+ Add Teacher</button>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Role</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
            <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{t.id}</td>
              <td style={{ padding: 10 }}>{t.firstName} {t.lastName}</td>
              <td style={{ padding: 10 }}>{t.email}</td>
              <td style={{ padding: 10 }}>{t.role}</td>
              <td style={{ padding: 10 }}>
                <span style={{ color: t.isActive ? 'green' : 'red' }}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                <button onClick={() => handleEdit(t.id)} style={{ marginRight: 5 }}>Edit</button>
                <button onClick={() => handleDelete(t.id)} style={{ color: 'red' }}>Delete</button>
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

export default Teachers;