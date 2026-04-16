import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const ProgressChart = ({ data }) => {
  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    weight: entry.weight,
    performance: entry.performanceScore
  }));

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">Progress Overview</h3>
        <p className="mt-2 text-sm text-slate-400">
          Track body weight and overall performance improvements over time.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                borderRadius: "18px"
              }}
            />
            <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={3} />
            <Line type="monotone" dataKey="performance" stroke="#38bdf8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
