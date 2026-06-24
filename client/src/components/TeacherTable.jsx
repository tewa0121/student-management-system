// function TeacherTable({
//   teachers,
//   search,
//   onEdit,
//   onDelete,
// }) {
//   const filteredTeachers = teachers.filter((teacher) => {
//     return (
//       teacher.teacher_id
//         .toLowerCase()
//         .includes(search.toLowerCase()) ||
//       teacher.first_name
//         .toLowerCase()
//         .includes(search.toLowerCase()) ||
//       teacher.last_name
//         .toLowerCase()
//         .includes(search.toLowerCase()) ||
//       teacher.department
//         .toLowerCase()
//         .includes(search.toLowerCase())
//     );
//   });

//   return (
//     <table className="table table-bordered table-striped">
//       <thead className="table-dark">
//         <tr>
//           <th>ID</th>
//           <th>Teacher ID</th>
//           <th>Name</th>
//           <th>Gender</th>
//           <th>Email</th>
//           <th>Phone</th>
//           <th>Department</th>
//           <th>Actions</th>
//         </tr>
//       </thead>

//       <tbody>
//         {filteredTeachers.map((teacher) => (
//           <tr key={teacher.id}>
//             <td>{teacher.id}</td>

//             <td>{teacher.teacher_id}</td>

//             <td>
//               {teacher.first_name} {teacher.last_name}
//             </td>

//             <td>{teacher.gender}</td>

//             <td>{teacher.email}</td>

//             <td>{teacher.phone}</td>

//             <td>{teacher.department}</td>

//             <td>
//               <button
//                 className="btn btn-warning btn-sm me-2"
//                 onClick={() => onEdit(teacher)}
//               >
//                 Edit
//               </button>

//               <button
//                 className="btn btn-danger btn-sm"
//                 onClick={() => onDelete(teacher.id)}
//               >
//                 Delete
//               </button>
//             </td>
//           </tr>
//         ))}

//         {filteredTeachers.length === 0 && (
//           <tr>
//             <td colSpan="8" className="text-center">
//               No teachers found
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   );
// }

// export default TeacherTable;