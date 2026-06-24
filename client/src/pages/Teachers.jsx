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

const [editingTeacher, setEditingTeacher] = useState(null);
const [showForm, setShowForm] = useState(false);

const [selectedTeacher, setSelectedTeacher] = useState(null);
const [showDetails, setShowDetails] = useState(false);

const [currentPage, setCurrentPage] = useState(1);

const teachersPerPage = 10;

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

const handleEdit = (teacher) => {
setEditingTeacher(teacher);
setShowForm(true);


window.scrollTo({
  top: 0,
  behavior: "smooth",
});


};

const handleView = (teacher) => {
setSelectedTeacher(teacher);
setShowDetails(true);
};

const filteredTeachers = teachers.filter((teacher) => {
return (
teacher.teacher_id
?.toLowerCase()
.includes(search.toLowerCase()) ||
teacher.first_name
?.toLowerCase()
.includes(search.toLowerCase()) ||
teacher.last_name
?.toLowerCase()
.includes(search.toLowerCase()) ||
teacher.department
?.toLowerCase()
.includes(search.toLowerCase())
);
});

const indexOfLastTeacher =
currentPage * teachersPerPage;

const indexOfFirstTeacher =
indexOfLastTeacher - teachersPerPage;

const currentTeachers =
filteredTeachers.slice(
indexOfFirstTeacher,
indexOfLastTeacher
);

return ( <DashboardLayout> <div className="d-flex justify-content-between align-items-center mb-4"> <h2>Teachers</h2>


    <button
      className="btn btn-primary"
      onClick={() => {
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
      onTeacherAdded={() => {
        loadTeachers();
        setEditingTeacher(null);
        setShowForm(false);
      }}
      onCancel={() => {
        setEditingTeacher(null);
        setShowForm(false);
      }}
    />
  )}

  <div className="mb-3">
    <input
      type="text"
      className="form-control"
      placeholder="Search Teacher..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
      }}
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
        <th>Photo</th>
        <th width="220">Actions</th>
      </tr>
    </thead>

    <tbody>
      {currentTeachers.length > 0 ? (
        currentTeachers.map((teacher) => (
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
              {teacher.photo ? (
                <img
                  src={`http://localhost:5000/uploads/${teacher.photo}`}
                  alt="Teacher"
                  width="50"
                  height="50"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                "No Photo"
              )}
            </td>

            <td>
              <button
                className="btn btn-info btn-sm me-2"
                onClick={() =>
                  handleView(teacher)
                }
              >
                View
              </button>

              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() =>
                  handleEdit(teacher)
                }
              >
                Edit
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  handleDelete(teacher.id)
                }
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="9"
            className="text-center"
          >
            No teachers found.
          </td>
        </tr>
      )}
    </tbody>
  </table>

  <div className="d-flex justify-content-center align-items-center mt-4">
    <button
      className="btn btn-outline-primary me-3"
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(currentPage - 1)
      }
    >
      Previous
    </button>

    <span>
      Page {currentPage} of{" "}
      {Math.max(
        1,
        Math.ceil(
          filteredTeachers.length /
            teachersPerPage
        )
      )}
    </span>

    <button
      className="btn btn-outline-primary ms-3"
      disabled={
        currentPage >=
        Math.ceil(
          filteredTeachers.length /
            teachersPerPage
        )
      }
      onClick={() =>
        setCurrentPage(currentPage + 1)
      }
    >
      Next
    </button>
  </div>

  {showDetails && selectedTeacher && (
    <div
      className="modal d-block"
      style={{
        backgroundColor:
          "rgba(0,0,0,0.5)",
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Teacher Details
            </h5>

            <button
              className="btn-close"
              onClick={() =>
                setShowDetails(false)
              }
            ></button>
          </div>

          <div className="modal-body">
            {selectedTeacher.photo && (
              <div className="text-center mb-3">
                <img
                  src={`http://localhost:5000/uploads/${selectedTeacher.photo}`}
                  alt="Teacher"
                  width="120"
                  height="120"
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <p>
              <strong>Teacher ID:</strong>{" "}
              {selectedTeacher.teacher_id}
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {selectedTeacher.first_name}{" "}
              {selectedTeacher.last_name}
            </p>

            <p>
              <strong>Gender:</strong>{" "}
              {selectedTeacher.gender}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedTeacher.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedTeacher.phone}
            </p>

            <p>
              <strong>Department:</strong>{" "}
              {selectedTeacher.department}
            </p>

            <p>
              <strong>Hire Date:</strong>{" "}
              {selectedTeacher.hire_date}
            </p>

            <p>
              <strong>Salary:</strong>{" "}
              {selectedTeacher.salary}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {selectedTeacher.address}
            </p>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() =>
                setShowDetails(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</DashboardLayout>


);
}

export default Teachers;
