import axios from "axios";

const API_URL = "http://localhost:5000/api/students";

// ======================
// GET ALL STUDENTS
// ======================

export const getStudents = async () => {
const response = await axios.get(API_URL);
return response.data;
};

// ======================
// ADD STUDENT
// ======================

export const addStudent = async (student) => {
const response = await axios.post(
API_URL,
student
);

return response.data;
};

// ======================
// UPDATE STUDENT
// ======================

export const updateStudent = async (
id,
student
) => {
const response = await axios.put(
`${API_URL}/${id}`,
student
);

return response.data;
};

// ======================
// DELETE STUDENT
// ======================

export const deleteStudent = async (
id
) => {
const response = await axios.delete(
`${API_URL}/${id}`
);

return response.data;
};
