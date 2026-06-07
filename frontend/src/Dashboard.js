import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

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
      console.log("Error fetching stats:", err);
    }
  };

  if (!stats) return <p style={{ padding: "2rem", textAlign: "center", fontSize: "18px" }}>📊 Loading analytics...</p>;

  // Chart data
  const barData = {
    labels: stats.companies.map((c) => c.company),
    datasets: [{
      label: "Total Applicants",
      data: stats.companies.map((c) => c.applicants),
      backgroundColor: "#4F46E5",
      borderRadius: 8
    }, {
      label: "Offers",
      data: stats.companies.map((c) => c.offers || 0),
      backgroundColor: "#10B981",
      borderRadius: 8
    }]
  };

  const applicationStatusData = {
    labels: ["Offers", "Rejected", "Pending"],
    datasets: [{
      data: [
        stats.total_offers,
        stats.total_rejected,
        stats.total_pending
      ],
      backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
      borderColor: ["#059669", "#DC2626", "#D97706"],
      borderWidth: 2
    }]
  };

  const statsCard = (label, value, color, icon, subtitle = "") => (
    <div style={{ 
      background: "white", 
      border: `2px solid ${color}`, 
      borderRadius: "12px", 
      padding: "1.5rem", 
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      minHeight: "140px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{label}</div>
      {subtitle && <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{subtitle}</div>}
    </div>
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "#4F46E5", marginBottom: "1.5rem" }}>📊 Analytics Dashboard</h2>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "2rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "1rem" }}>
        <button onClick={() => setActiveTab("overview")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "overview" ? "#4F46E5" : "transparent",
            color: activeTab === "overview" ? "white" : "#666",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
          📈 Overview
        </button>
        {role === "student" && (
          <button onClick={() => setActiveTab("myStats")}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === "myStats" ? "#4F46E5" : "transparent",
              color: activeTab === "myStats" ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}>
            👤 My Statistics
          </button>
        )}
        <button onClick={() => setActiveTab("companies")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "companies" ? "#4F46E5" : "transparent",
            color: activeTab === "companies" ? "white" : "#666",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
          🏢 Company Stats
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <h3 style={{ color: "#333", marginBottom: "1.5rem" }}>Platform Statistics</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
            {statsCard("Total Opportunities", stats.total_opportunities, "#4F46E5", "💼")}
            {statsCard("Total Applications", stats.total_applications, "#F59E0B", "📝")}
            {statsCard("Acceptance Rate", `${stats.acceptance_rate}%`, "#10B981", "✅")}
            {statsCard("Offers Issued", stats.total_offers, "#10B981", "🎉")}
            {statsCard("Pending Reviews", stats.total_pending, "#F59E0B", "⏳")}
            {statsCard("Rejected", stats.total_rejected, "#EF4444", "❌")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Application Status Breakdown</h3>
              <Pie data={applicationStatusData} />
            </div>
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Key Metrics</h3>
              <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                <p><strong>📊 Total Applications:</strong> {stats.total_applications}</p>
                <p><strong>✅ Offers:</strong> {stats.total_offers} ({stats.acceptance_rate}% acceptance)</p>
                <p><strong>⏳ Pending:</strong> {stats.total_pending}</p>
                <p><strong>❌ Rejected:</strong> {stats.total_rejected}</p>
                <p><strong>🏢 Companies Hiring:</strong> {stats.companies.length}</p>
                <p><strong>💼 Active Positions:</strong> {stats.total_opportunities}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* My Statistics Tab (Student Only) */}
      {activeTab === "myStats" && role === "student" && stats.student_stats && (
        <>
          <h3 style={{ color: "#333", marginBottom: "1.5rem" }}>Your Application Statistics</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "2rem" }}>
            {statsCard("Applications Sent", stats.student_stats.applications, "#4F46E5", "📨", "total applications")}
            {statsCard("Your Acceptance Rate", `${stats.student_stats.acceptance_rate}%`, "#10B981", "✅", "of your applications")}
            {statsCard("Offers Received", stats.student_stats.offers, "#10B981", "🎉", "great job!")}
            {statsCard("Pending Review", stats.student_stats.pending, "#F59E0B", "⏳", "awaiting response")}
            {statsCard("Rejected", stats.student_stats.rejected, "#EF4444", "❌", "keep trying")}
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Your Performance Summary</h3>
            <div style={{ fontSize: "14px", lineHeight: "2" }}>
              <p>📨 You've applied to <strong>{stats.student_stats.applications}</strong> opportunities</p>
              <p>✅ You've received <strong>{stats.student_stats.offers}</strong> offers ({stats.student_stats.acceptance_rate}% success rate)</p>
              <p>⏳ <strong>{stats.student_stats.pending}</strong> application(s) are pending review</p>
              <p style={{ marginTop: "1rem", color: "#666" }}>
                {stats.student_stats.acceptance_rate >= 50 ? "🌟 Excellent performance! Keep applying!" : "💪 Keep improving your profile and applications!"}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Company Stats Tab */}
      {activeTab === "companies" && (
        <>
          <h3 style={{ color: "#333", marginBottom: "1.5rem" }}>Opportunities by Company</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", gridColumn: "1 / -1" }}>
              <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Applicants vs Offers by Company</h3>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", gridColumn: "1 / -1" }}>
              <h3 style={{ color: "#4F46E5", marginTop: 0 }}>Detailed Company Breakdown</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e0e0e0", backgroundColor: "#f9f9f9" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Company</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Total Applicants</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Offers</th>
                      <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Acceptance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.companies.map((company, idx) => {
                      const acceptanceRate = company.applicants > 0 ? Math.round((company.offers || 0) / company.applicants * 100) : 0;
                      return (
                        <tr key={idx} style={{ borderBottom: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{company.company}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{company.applicants}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "#10B981", fontWeight: "bold" }}>{company.offers || 0}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "#4F46E5", fontWeight: "bold" }}>{acceptanceRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}