import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent, createStudent, updateStudent, getClasses, getSections } from '../api/students';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    studentId: '',
    admissionNo: '',
    firstName: '',
    lastName: '',
    middleName: '',
    gender: 'Male',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    class: '',
    section: '',
    rollNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    previousSchool: '',
    previousStudentId: '',
    medicalNotes: '',
    specialRequirements: '',
    notes: ''
  });

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, sectionRes] = await Promise.all([
          getClasses(),
          getSections()
        ]);
        setClasses(classRes.data);
        setSections(sectionRes.data.filter(s => s));

        if (isEditing) {
          const studentRes = await getStudent(id);
          const data = studentRes.data;
          setFormData({
            ...data,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
            admissionDate: data.admissionDate ? new Date(data.admissionDate).toISOString().split('T')[0] : ''
          });
        }
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateStudent(id, formData);
      } else {
        await createStudent(formData);
      }
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>{isEditing ? 'Edit Student' : 'Add New Student'}</h1>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <input name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required />
          <input name="admissionNo" placeholder="Admission No" value={formData.admissionNo} onChange={handleChange} required />
          <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} />
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          <input name="placeOfBirth" placeholder="Place of Birth" value={formData.placeOfBirth} onChange={handleChange} />
          <input name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleChange} />
          <input name="bloodGroup" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} />
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
          <input name="region" placeholder="Region" value={formData.region} onChange={handleChange} />
          <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
          <input name="class" placeholder="Class" value={formData.class} onChange={handleChange} list="classList" />
          <datalist id="classList">
            {classes.map(c => <option key={c} value={c} />)}
          </datalist>
          <input name="section" placeholder="Section" value={formData.section} onChange={handleChange} list="sectionList" />
          <datalist id="sectionList">
            {sections.map(s => <option key={s} value={s} />)}
          </datalist>
          <input name="rollNo" placeholder="Roll No" value={formData.rollNo} onChange={handleChange} />
          <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} required />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Transferred">Transferred</option>
            <option value="Suspended">Suspended</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Expelled">Expelled</option>
          </select>
        </div>
        <div style={{ marginTop: 20 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Student' : 'Create Student'}
          </button>
          <button type="button" onClick={() => navigate('/students')} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;