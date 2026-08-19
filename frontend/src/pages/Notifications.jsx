import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [notifRes, unreadRes] = await Promise.all([
        axios.get(API_URL, getAuthHeader()),
        axios.get(`${API_URL}/unread`, getAuthHeader()),
      ]);
      setNotifications(notifRes.data.notifications || []);
      setUnread(unreadRes.data.unread || 0);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`, {}, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/read-all`, {}, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Notifications {unread > 0 && <span style={{ background: 'red', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 14 }}>{unread} unread</span>}</h1>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding: '8px 16px' }}>Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th>Title</th><th>Message</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.id} style={{ borderBottom: '1px solid #ddd', background: n.isRead ? 'transparent' : '#f0f8ff' }}>
                <td><strong>{n.title}</strong></td>
                <td>{n.message}</td>
                <td>{n.type}</td>
                <td>{new Date(n.createdAt).toLocaleString()}</td>
                <td>{n.isRead ? '✅ Read' : '🔵 Unread'}</td>
                <td>
                  {!n.isRead && <button onClick={() => markAsRead(n.id)} style={{ marginRight: 5 }}>Mark Read</button>}
                  <button onClick={() => deleteNotification(n.id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Notifications;