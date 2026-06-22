import { useState } from "react";
import { addTeacher } from "../services/teacherService";

function TeacherForm() {
  const [teacher, setTeacher] = useState({
    teacher_id: "",
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    phone: "",
    department: "",
    hire_date: "",
    salary: "",
  });

  // Handle all input changes
  const handleChange = (e) => {
    setTeacher({
      ...teacher,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const result = await addTeacher(teacher);

    alert(result.message);

    setTeacher({
      teacher_id: "",
      first_name: "",
      last_name: "",
      gender: "",
      email: "",
      phone: "",
      department: "",
      hire_date: "",
      salary: "",
    });

  } catch (error) {
    console.log(error);

    alert("Failed to add teacher");
  }
};

  return (
    <form className="card p-4 mb-4" onSubmit={handleSubmit}>
      <h4 className="mb-3">Add New Teacher</h4>

      <div className="mb-3">
        <label className="form-label">Teacher ID</label>
        <input
          type="text"
          name="teacher_id"
          value={teacher.teacher_id}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter Teacher ID"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">First Name</label>
        <input
          type="text"
          name="first_name"
          value={teacher.first_name}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter First Name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Last Name</label>
        <input
          type="text"
          name="last_name"
          value={teacher.last_name}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter Last Name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Gender</label>

        <select
          name="gender"
          value={teacher.gender}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          value={teacher.email}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter Email"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Phone</label>
        <input
          type="text"
          name="phone"
          value={teacher.phone}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter Phone Number"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Department</label>
        <input
          type="text"
          name="department"
          value={teacher.department}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter Department"
        />
      </div>
 <div className="mb-3">
        <label className="form-label">Hire Date</label>
        <input
          type="date"
          name="hire_date"
          value={teacher.hire_date}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Salary</label>
        <input
          type="number"
          name="salary"
          value={teacher.salary}
          onChange={handleChange}
          className="form-control"
          placeholder="Enter Salary"
        />
      </div>
      
      <button type="submit" className="btn btn-success">
        Save Teacher
      </button>
    </form>
  );
}

export default TeacherForm;