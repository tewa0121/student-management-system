import { useEffect, useState } from "react";
import API from "../services/api";

function Students() {

    const [students, setStudents] = useState([]);

    useEffect(() => {

        fetchStudents();

    }, []);

    const fetchStudents = async () => {

        try {

            const res = await API.get("/students");

            setStudents(res.data.data);

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div className="container mt-4">

            <h2>Students</h2>

            <table className="table table-bordered">

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Student ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        students.map(student => (

                            <tr key={student.id}>

                                <td>{student.id}</td>
                                <td>{student.student_id}</td>
                                <td>{student.first_name}</td>
                                <td>{student.last_name}</td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default Students;