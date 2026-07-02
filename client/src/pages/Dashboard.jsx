import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/DashboardCard";
import { getDashboardStats } from "../services/dashboardService";

function Dashboard() {
const [stats, setStats] = useState({
totalStudents: 0,
totalTeachers: 0,
});

useEffect(() => {
loadDashboardStats();
}, []);

const loadDashboardStats = async () => {
try {
const response = await getDashboardStats();


  if (response.success) {
    setStats(response.data);
  }
} catch (error) {
  console.error("Dashboard Error:", error);
}


};

return ( <DashboardLayout> <h2 className="mb-4">Dashboard</h2>


  <div className="row">
    <DashboardCard
      title="Total Students"
      value={stats.totalStudents}
      color="primary"
    />

    <DashboardCard
      title="Total Teachers"
      value={stats.totalTeachers}
      color="success"
    />

    <DashboardCard
      title="Departments"
      value="0"
      color="warning"
    />

    <DashboardCard
      title="Courses"
      value="0"
      color="danger"
    />
  </div>
</DashboardLayout>


);
}

export default Dashboard;
