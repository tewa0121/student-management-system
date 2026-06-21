const API_URL = "http://localhost:5000/api/teachers";

// Get all teachers
export const getTeachers = async () => {
  const response = await fetch(API_URL);

  const data = await response.json();

  return data;
};