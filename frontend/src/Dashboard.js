import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!stats) return <p style={{ padding: "2rem" }}>Loading...</p>;

  const barData = {
    labels: stats.companies.map((c) => c.company),
    datasets: [{
      label: "Applicants",
      data: stats.companies.map((c) => c.applicants),
      backgroundColor: "#4F46E5"
    }]
  };

  const pieData = {
    labels: ["Offers", "Rejected", "Others"],
    datasets: [{
      data: [
        stats.total_offers,
        stats.total_rejected,
        stats.total_applications - stats.total_offers - stats.total_rejected
      ],
      backgroundColor: ["#10B981", "#EF4444", "#F59E0B"]
    }]
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#4F46E5" }}>Analytics Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
        {[
          { label: "Total Opportunities", value: stats.total_opportunities, color: "#4F46E5" },
          { label: "Total Applications", value: stats.total_applications, color: "#F59E0B" },
          { label: "Total Offers", value: stats.total_offers, color: "#10B981" },
          { label: "Total Rejected", value: stats.total_rejected, color: "#EF4444" },
        ].map((card) => (
          <div key={card.label} style={{ background: "white", border: `2px solid ${card.color}`, borderRadius: "12px", padding: "1.5rem", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Applicants by Company</h3>
          <Bar data={barData} />
        </div>
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Offer vs Rejection Rate</h3>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
}