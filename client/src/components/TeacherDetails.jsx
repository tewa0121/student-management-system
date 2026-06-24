function TeacherDetails({
  teacher,
  onClose,
}) {
  if (!teacher) return null;

  return (
    <div className="card mt-4 shadow">
      <div className="card-header bg-primary text-white">
        <h4>Teacher Details</h4>
      </div>

      <div className="card-body">

        <p><strong>Teacher ID:</strong> {teacher.teacher_id}</p>

        <p><strong>Name:</strong> {teacher.first_name} {teacher.last_name}</p>

        <p><strong>Gender:</strong> {teacher.gender}</p>

        <p><strong>Email:</strong> {teacher.email}</p>

        <p><strong>Phone:</strong> {teacher.phone}</p>

        <p><strong>Department:</strong> {teacher.department}</p>

        <p><strong>Hire Date:</strong> {teacher.hire_date}</p>

        <p><strong>Salary:</strong> {teacher.salary}</p>

        <p><strong>Address:</strong> {teacher.address}</p>

        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          Close
        </button>

      </div>
    </div>
  );
}

export default TeacherDetails;