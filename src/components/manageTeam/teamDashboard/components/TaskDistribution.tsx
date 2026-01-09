import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TaskDistributionProps {
  teamStats: any;
}

const TaskDistribution: React.FC<TaskDistributionProps> = ({ teamStats }) => {
  const data = [
    {
      name: "Completed",
      value: teamStats.completedTasks || 0,
      color: "#10b981",
    },
    {
      name: "In Progress",
      value: teamStats.inProgressTasks || 0,
      color: "#3b82f6",
    },
    {
      name: "Pending",
      value:
        (teamStats.totalTasks || 0) -
        (teamStats.completedTasks || 0) -
        (teamStats.inProgressTasks || 0),
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
      <h3 className="text-lg font-bold text-gray-700 mb-6">
        Task Distribution
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskDistribution;
