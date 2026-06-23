
import axios from "axios";

const API_URL = "http://localhost:5000/api/teachers";

// ======================
// GET ALL TEACHERS
// ======================

export const getTeachers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// ======================
// ADD TEACHER
// ======================

export const addTeacher = async (teacher) => {
  const response = await axios.post(API_URL, teacher);
  return response.data;
};

// ======================
// UPDATE TEACHER
// ======================

export const updateTeacher = async (id, teacher) => {
  const response = await axios.put(`${API_URL}/${id}`, teacher);
  return response.data;
};

// ======================
// DELETE TEACHER
// ======================

export const deleteTeacher = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

