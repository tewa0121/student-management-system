import { useState, useEffect } from "react";
import {
addStudent,
updateStudent,
} from "../services/studentService";

function StudentForm({
editingStudent,
onStudentAdded,
onCancel,
}) {
const initialStudent = {
student_id: "",
first_name: "",
last_name: "",
gender: "",
email: "",
phone: "",
date_of_birth: "",
department: "",
year_level: "",
address: "",
};

const [student, setStudent] =
useState(initialStudent);

useEffect(() => {
if (editingStudent) {
setStudent({
...editingStudent,
date_of_birth:
editingStudent.date_of_birth
? editingStudent.date_of_birth.substring(
0,
10
)
: "",
});
} else {
setStudent(initialStudent);
}
}, [editingStudent]);

const handleChange = (e) => {
setStudent({
...student,
[e.target.name]: e.target.value,
});
};

const handleSubmit = async (e) => {
e.preventDefault();

```
try {
  let result;

  if (student.id) {
    result = await updateStudent(
      student.id,
      student
    );
  } else {
    result = await addStudent(
      student
    );
  }

  alert(result.message);

  setStudent(initialStudent);

  if (onStudentAdded) {
    onStudentAdded();
  }
} catch (error) {
  console.log(error);

  alert(
    error.response?.data?.message ||
      "Failed to save student"
  );
}
```

};

return ( <div className="card shadow-sm mb-4"> <div className="card-body">

```
    <h4 className="mb-4">
      {student.id
        ? "Edit Student"
        : "Add Student"}
    </h4>

    <form onSubmit={handleSubmit}>

      <div className="row">

        <div className="col-md-6 mb-3">
          <label>Student ID</label>

          <input
            type="text"
            name="student_id"
            className="form-control"
            value={student.student_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>First Name</label>

          <input
            type="text"
            name="first_name"
            className="form-control"
            value={student.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Last Name</label>

          <input
            type="text"
            name="last_name"
            className="form-control"
            value={student.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Gender</label>

          <select
            name="gender"
            className="form-select"
            value={student.gender}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label>Email</label>

          <input
            type="email"
            name="email"
            className="form-control"
            value={student.email}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            className="form-control"
            value={student.phone}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Date Of Birth</label>

          <input
            type="date"
            name="date_of_birth"
            className="form-control"
            value={student.date_of_birth}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Department</label>

          <input
            type="text"
            name="department"
            className="form-control"
            value={student.department}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Year Level</label>

          <input
            type="text"
            name="year_level"
            className="form-control"
            value={student.year_level}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 mb-3">
          <label>Address</label>

          <textarea
            name="address"
            className="form-control"
            rows="3"
            value={student.address}
            onChange={handleChange}
          />
        </div>

      </div>

      <button
        type="submit"
        className={
          student.id
            ? "btn btn-warning"
            : "btn btn-success"
        }
      >
        {student.id
          ? "Update Student"
          : "Save Student"}
      </button>

      <button
        type="button"
        className="btn btn-secondary ms-2"
        onClick={onCancel}
      >
        Cancel
      </button>

    </form>

  </div>
</div>


);
}

export default StudentForm;
