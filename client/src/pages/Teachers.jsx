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

  // Edit teacher
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showForm, setShowForm] = useState(false);
  

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const result = await getTeachers();
      setTeachers(result.data);
    } catch (error) {
      console.log(error);
    }
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
const [currentPage, setCurrentPage] = useState(1);

const teachersPerPage = 10;
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const indexOfLastTeacher =
currentPage * teachersPerPage;

const indexOfFirstTeacher =
indexOfLastTeacher - teachersPerPage;

const currentTeachers =
teachers
.filter((teacher)=>{

return(

teacher.teacher_id.toLowerCase().includes(search.toLowerCase()) ||

teacher.first_name.toLowerCase().includes(search.toLowerCase()) ||

teacher.last_name.toLowerCase().includes(search.toLowerCase()) ||

teacher.department.toLowerCase().includes(search.toLowerCase())

);

})
.slice(indexOfFirstTeacher,indexOfLastTeacher);


  return (
    <DashboardLayout>
      <h2 className="mb-4">Teachers</h2>
      <div className="d-flex justify-content-between mb-4">

<h2>Teachers</h2>

<button
className="btn btn-primary"
onClick={()=>{
setEditingTeacher(null);
setShowForm(true);
}}
>

+ Add Teacher

</button>

</div>

      {showForm && (

<TeacherForm
editingTeacher={editingTeacher}
onTeacherAdded={()=>{
loadTeachers();
setEditingTeacher(null);
setShowForm(false);
}}
onCancel={()=>{
setShowForm(false);
setEditingTeacher(null);
}}
/>

)}

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
            <th>Name</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentTeachers
            .map((teacher) => {
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

                <td>
                  {teacher.first_name} {teacher.last_name}
                </td>

                <td>{teacher.gender}</td>

                <td>{teacher.email}</td>

                <td>{teacher.phone}</td>

                <td>{teacher.department}</td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(teacher)}
                  >
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
            <div className="d-flex justify-content-center mt-4">

<button

className="btn btn-outline-primary me-2"

disabled={currentPage===1}

onClick={()=>setCurrentPage(currentPage-1)}

>

Previous

</button>

<span className="align-self-center">

Page {currentPage}

</span>

<button

className="btn btn-outline-primary ms-2"

disabled={
indexOfLastTeacher>=teachers.length
}

onClick={()=>setCurrentPage(currentPage+1)}

>

Next

</button>

</div>
        </tbody>
      </table>
    </DashboardLayout>
  );
}

export default Teachers;