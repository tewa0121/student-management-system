import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getStudents = (page = 1, limit = 10, search = '', classFilter = '', section = '', status = '') => {
  const params = new URLSearchParams({
    page,
    limit,
    search,
    class: classFilter,
    section,
    status
  });
  return axios.get(`${API_URL}?${params.toString()}`, getAuthHeader());
};

export const getStudent = (id) => {
  return axios.get(`${API_URL}/${id}`, getAuthHeader());
};

export const createStudent = (data) => {
  return axios.post(API_URL, data, getAuthHeader());
};

export const updateStudent = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, getAuthHeader());
};

export const deleteStudent = (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeader());
};

export const getClasses = () => {
  return axios.get(`${API_URL}/classes`, getAuthHeader());
};

export const getSections = () => {
  return axios.get(`${API_URL}/sections`, getAuthHeader());
};