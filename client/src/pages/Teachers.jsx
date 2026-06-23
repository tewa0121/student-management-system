import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import TeacherForm from "../components/TeacherForm";
import {
  getTeachers,
  deleteTeacher,
} from "../services/teacherService";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const result = await getTeachers();
    setTeachers(result.data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher?")) return;

    try {
      const result = await deleteTeacher(id);

      alert(result.message);

      loadTeachers();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="mb-4">Teachers</h2>

      <TeacherForm onTeacherAdded={loadTeachers} />

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search Teacher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Teacher ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Gender</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {teachers
            .filter((teacher) => {
              return (
                teacher.teacher_id
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                teacher.first_name
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                teacher.last_name
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                teacher.department
                  .toLowerCase()
                  .includes(search.toLowerCase())
              );
            })
            .map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.id}</td>
                <td>{teacher.teacher_id}</td>
                <td>{teacher.first_name}</td>
                <td>{teacher.last_name}</td>
                <td>{teacher.gender}</td>
                <td>{teacher.department}</td>

                <td>
                  <button className="btn btn-warning btn-sm me-2">
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(teacher.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default Teachers;