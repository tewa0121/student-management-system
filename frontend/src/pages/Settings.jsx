import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/settings';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      const settingsObj = {};
      res.data.forEach(item => {
        settingsObj[item.settingKey] = item.settingValue;
      });
      setSettings(settingsObj);
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = Object.entries(settings).map(([key, value]) => ({
        settingKey: key,
        settingValue: value,
      }));
      await axios.put(API_URL, { settings: payload }, getAuthHeader());
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>System Settings</h1>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>School Name</label>
            <input
              type="text"
              value={settings.school_name || ''}
              onChange={(e) => handleChange('school_name', e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>School Address</label>
            <input
              type="text"
              value={settings.school_address || ''}
              onChange={(e) => handleChange('school_address', e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Phone Number</label>
            <input
              type="text"
              value={settings.school_phone || ''}
              onChange={(e) => handleChange('school_phone', e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              value={settings.school_email || ''}
              onChange={(e) => handleChange('school_email', e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Currency</label>
            <input
              type="text"
              value={settings.currency || 'USD'}
              onChange={(e) => handleChange('currency', e.target.value)}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Timezone</label>
            <select
              value={settings.timezone || 'UTC'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Africa/Nairobi">Africa/Nairobi</option>
              <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label style={{ fontWeight: 'bold' }}>Grading Scale (JSON)</label>
          <textarea
            value={settings.grading_system || '{"A+":90,"A":80,"B":70,"C":60,"D":50,"F":0}'}
            onChange={(e) => handleChange('grading_system', e.target.value)}
            rows={5}
            style={{ width: '100%', padding: 8, fontFamily: 'monospace' }}
          />
          <small style={{ color: '#666' }}>
            Format: {"{ \"A+\": 90, \"A\": 80, \"B\": 70, \"C\": 60, \"D\": 50, \"F\": 0 }"}
          </small>
        </div>

        <button
          type="submit"
          disabled={saving}
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
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;