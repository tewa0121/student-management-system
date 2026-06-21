import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getTeachers } from "../services/teacherService";
import TeacherForm from "../components/TeacherForm";

function Teachers() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const result = await getTeachers();
    setTeachers(result.data);
  };

  return (
    <DashboardLayout>
     <div className="d-flex justify-content-between align-items-center mb-4">
  <h2>Teachers</h2>

  <button className="btn btn-primary">
    + Add Teacher
  </button>
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
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.id}</td>
              <td>{teacher.teacher_id}</td>
              <td>{teacher.first_name}</td>
              <td>{teacher.last_name}</td>
              <td>{teacher.gender}</td>
              <td>{teacher.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default Teachers;