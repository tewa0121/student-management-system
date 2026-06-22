import axios from "axios";

const API_URL = "http://localhost:5000/api/teachers";

// Get all teachers
export const getTeachers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Add new teacher
export const addTeacher = async (teacher) => {
  const response = await axios.post(API_URL, teacher);
  return response.data;
};