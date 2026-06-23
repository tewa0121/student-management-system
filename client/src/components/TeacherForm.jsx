
import { useState, useEffect } from "react";
import {
  addTeacher,
  updateTeacher,
} from "../services/teacherService";

function TeacherForm({
editingTeacher,
onTeacherAdded,
onCancel,
}) {
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
    address: "",
  });

  useEffect(() => {
    if (editingTeacher) {
      setTeacher({
        teacher_id: editingTeacher.teacher_id || "",
        first_name: editingTeacher.first_name || "",
        last_name: editingTeacher.last_name || "",
        gender: editingTeacher.gender || "",
        email: editingTeacher.email || "",
        phone: editingTeacher.phone || "",
        department: editingTeacher.department || "",
        hire_date: editingTeacher.hire_date || "",
        salary: editingTeacher.salary || "",
        address: editingTeacher.address || "",
        id: editingTeacher.id,
      });
    }
  }, [editingTeacher]);

  const handleChange = (e) => {
    setTeacher({
      ...teacher,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;

      if (teacher.id) {
        result = await updateTeacher(
          teacher.id,
          teacher
        );
      } else {
        result = await addTeacher(teacher);
      }

      alert(result.message);

      if (onTeacherAdded) {
        onTeacherAdded();
      }

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
        address: "",
      });
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to save teacher"
      );
    }
  };

  return (
    <form className="card p-4 mb-4" onSubmit={handleSubmit}>
      <h4 className="mb-3">
        {teacher.id
          ? "Edit Teacher"
          : "Add New Teacher"}
      </h4>

      <div className="mb-3">
        <label>Teacher ID</label>

        <input
          type="text"
          name="teacher_id"
          value={teacher.teacher_id}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>First Name</label>

        <input
          type="text"
          name="first_name"
          value={teacher.first_name}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Last Name</label>

        <input
          type="text"
          name="last_name"
          value={teacher.last_name}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Gender</label>

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
        <label>Email</label>

        <input
          type="email"
          name="email"
          value={teacher.email}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Phone</label>

        <input
          type="text"
          name="phone"
          value={teacher.phone}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Department</label>

        <input
          type="text"
          name="department"
          value={teacher.department}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Hire Date</label>

        <input
          type="date"
          name="hire_date"
          value={teacher.hire_date}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Salary</label>

        <input
          type="number"
          name="salary"
          value={teacher.salary}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Address</label>

        <textarea
          name="address"
          value={teacher.address}
          onChange={handleChange}
          className="form-control"
          rows="3"
        />
      </div>

      <button
        type="submit"
        className={
          teacher.id
            ? "btn btn-warning"
            : "btn btn-success"
        }
      >
        {teacher.id
          ? "Update Teacher"
          : "Save Teacher"}
      </button>
      <button
type="button"
className="btn btn-secondary ms-2"
onClick={onCancel}
>

Cancel

</button>
    </form>
  );
}

export default TeacherForm;

