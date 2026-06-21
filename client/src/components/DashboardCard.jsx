function DashboardCard({ title, value, color }) {
  return (
    <div className="col-md-3 mb-4">
      <div className={`card border-${color} shadow`}>
        <div className="card-body text-center">
          <h5 className="card-title">{title}</h5>

          <h1 className={`text-${color}`}>
            {value}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;