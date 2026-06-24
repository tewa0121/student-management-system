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
const initialTeacher = {
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
photo: null,
};

const [teacher, setTeacher] =
useState(initialTeacher);

useEffect(() => {
if (editingTeacher) {
setTeacher({
teacher_id:
editingTeacher.teacher_id || "",
first_name:
editingTeacher.first_name || "",
last_name:
editingTeacher.last_name || "",
gender:
editingTeacher.gender || "",
email:
editingTeacher.email || "",
phone:
editingTeacher.phone || "",
department:
editingTeacher.department || "",
hire_date:
editingTeacher.hire_date
? editingTeacher.hire_date.substring(
0,
10
)
: "",
salary:
editingTeacher.salary || "",
address:
editingTeacher.address || "",
photo:
editingTeacher.photo || null,
id: editingTeacher.id,
});
} else {
setTeacher(initialTeacher);
}
}, [editingTeacher]);

const handleChange = (e) => {
const {
name,
value,
files,
} = e.target;


setTeacher({
  ...teacher,
  [name]: files
    ? files[0]
    : value,
});


};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    Object.keys(teacher).forEach((key) => {
      if (
        teacher[key] !== null &&
        teacher[key] !== undefined
      ) {
        formData.append(
          key,
          teacher[key]
        );
      }
    });

    let result;

    if (teacher.id) {
      result = await updateTeacher(
        teacher.id,
        formData
      );
    } else {
      result = await addTeacher(
        formData
      );
    }

    alert(result.message);

    setTeacher(initialTeacher);

    if (onTeacherAdded) {
      onTeacherAdded();
    }
  } catch (error) {
    console.log(error);

    alert(
      error.response?.data?.message ||
      "Failed to save teacher"
    );
  }
};

return ( <div className="card shadow-sm mb-4"> <div className="card-body"> <h4 className="mb-4">
{teacher.id
? "Edit Teacher"
: "Add New Teacher"} </h4>


    <form onSubmit={handleSubmit}>
      <div className="row">

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Teacher ID
          </label>

          <input
            type="text"
            name="teacher_id"
            className="form-control"
            value={teacher.teacher_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            First Name
          </label>

          <input
            type="text"
            name="first_name"
            className="form-control"
            value={teacher.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Last Name
          </label>

          <input
            type="text"
            name="last_name"
            className="form-control"
            value={teacher.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Gender
          </label>

          <select
            name="gender"
            className="form-select"
            value={teacher.gender}
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
          <label className="form-label">
            Email
          </label>

          <input
            type="email"
            name="email"
            className="form-control"
            value={teacher.email}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            className="form-control"
            value={teacher.phone}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Department
          </label>

          <input
            type="text"
            name="department"
            className="form-control"
            value={teacher.department}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Hire Date
          </label>

          <input
            type="date"
            name="hire_date"
            className="form-control"
            value={teacher.hire_date}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Salary
          </label>

          <input
            type="number"
            name="salary"
            className="form-control"
            value={teacher.salary}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            Photo
          </label>

          <input
            type="file"
            name="photo"
            className="form-control"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="col-12 mb-3">
          <label className="form-label">
            Address
          </label>

          <textarea
            name="address"
            className="form-control"
            rows="3"
            value={teacher.address}
            onChange={handleChange}
          />
        </div>

      </div>

      <div className="mt-3">
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
          onClick={() => {
            setTeacher(
              initialTeacher
            );

            if (onCancel) {
              onCancel();
            }
          }}
        >
          Cancel
        </button>
      </div>

    </form>
  </div>
</div>


);
}

export default TeacherForm;
