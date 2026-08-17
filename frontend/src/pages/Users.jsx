import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(page, 10, search);
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/${id}/edit`);
  };

  if (loading && users.length === 0) return <div>Loading users...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>User Management</h1>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 300 }}
        />
        <button onClick={() => navigate('/users/new')} style={{ marginLeft: 10, padding: '8px 16px' }}>
          + Add User
        </button>
      </div>

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
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10 }}>{u.id}</td>
              <td style={{ padding: 10 }}>{u.firstName} {u.lastName}</td>
              <td style={{ padding: 10 }}>{u.email}</td>
              <td style={{ padding: 10 }}>{u.role}</td>
              <td style={{ padding: 10 }}>
                <span style={{ color: u.isActive ? 'green' : 'red' }}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: 10 }}>
                <button onClick={() => handleEdit(u.id)} style={{ marginRight: 5 }}>Edit</button>
                {u.id !== user?.id && (
                  <button onClick={() => handleDelete(u.id)} style={{ color: 'red' }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default Users;