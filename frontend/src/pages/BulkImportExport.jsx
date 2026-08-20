import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const BulkImportExport = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setError('');
    setImportResult(null);
    try {
      const res = await axios.post(`${API_URL}/import`, formData, {
        ...getAuthHeader(),
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(res.data.results);
      alert(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/export?format=${format}`, {
        ...getAuthHeader(),
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Bulk Import / Export</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
        {/* Import Section */}
        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
          <h2>Import Students</h2>
          <form onSubmit={handleImport}>
            <div style={{ marginBottom: 10 }}>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} required />
            </div>
            <div style={{ marginBottom: 10 }}>
              <small>Supported formats: CSV, Excel (.xlsx, .xls)</small><br />
              <small>Required columns: studentId, firstName, lastName, email, class</small>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            {importResult && (
              <div style={{ marginBottom: 10 }}>
                <p>Inserted: {importResult.inserted} / {importResult.total}</p>
                {importResult.errors.length > 0 && (
                  <details>
                    <summary style={{ color: 'orange' }}>{importResult.errors.length} errors</summary>
                    <pre style={{ fontSize: 12, maxHeight: 150, overflow: 'auto' }}>
                      {JSON.stringify(importResult.errors, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <button type="submit" disabled={uploading} style={{ padding: '8px 16px' }}>
              {uploading ? 'Uploading...' : 'Import'}
            </button>
          </form>
          <div style={{ marginTop: 10 }}>
            <a href="#" onClick={() => alert('Download template CSV with headers: studentId,firstName,lastName,email,class,section,gender,dateOfBirth,phone,address')}>
              Download template
            </a>
          </div>
        </div>

        {/* Export Section */}
        <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
          <h2>Export Students</h2>
          <p>Export the current student list (including filters if applied).</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button onClick={() => handleExport('csv')} disabled={exportLoading} style={{ padding: '8px 16px' }}>
              CSV
            </button>
            <button onClick={() => handleExport('excel')} disabled={exportLoading} style={{ padding: '8px 16px' }}>
              Excel
            </button>
          </div>
          {exportLoading && <div>Generating export...</div>}
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default BulkImportExport;