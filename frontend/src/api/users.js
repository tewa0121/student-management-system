import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// Helper to get the token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getUsers = (page = 1, limit = 10, search = '') => {
  return axios.get(`${API_URL}?page=${page}&limit=${limit}&search=${search}`, getAuthHeader());
};

export const getUser = (id) => {
  return axios.get(`${API_URL}/${id}`, getAuthHeader());
};

export const createUser = (data) => {
  return axios.post(API_URL, data, getAuthHeader());
};

export const updateUser = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, getAuthHeader());
};

export const deleteUser = (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeader());
};

export const getRoles = () => {
  return axios.get(`${API_URL}/roles/all`, getAuthHeader());
};

export const getPermissions = () => {
  return axios.get(`${API_URL}/permissions/all`, getAuthHeader());
};

export const getRolePermissions = (roleId) => {
  return axios.get(`${API_URL}/roles/${roleId}/permissions`, getAuthHeader());
};

export const assignPermission = (roleId, permissionId) => {
  return axios.post(`${API_URL}/roles/permissions/assign`, { roleId, permissionId }, getAuthHeader());
};

export const removePermission = (roleId, permissionId) => {
  return axios.delete(`${API_URL}/roles/permissions/remove`, { 
    ...getAuthHeader(),
    data: { roleId, permissionId }
  });
};