import { useState, useEffect } from "react";
import axios from "axios";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://127.0.0.1:5000/api/applications/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchApplications();
  };

  const statusColors = {
    Applied: "#4F46E5",
    Interview: "#F59E0B",
    Offer: "#10B981",
    Rejected: "#EF4444"
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#4F46E5" }}>My Applications</h2>
      {applications.length === 0 && <p>No applications yet. Apply for opportunities!</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {applications.map((app) => (
          <div key={app.id} style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: "#4F46E5", margin: "0 0 8px" }}>{app.title}</h3>
            <p style={{ margin: "4px 0" }}><strong>Company:</strong> {app.company}</p>
            <p style={{ margin: "4px 0" }}><strong>Stipend:</strong> {app.stipend}</p>
            <p style={{ margin: "4px 0" }}><strong>Deadline:</strong> {app.deadline}</p>
            <div style={{ marginTop: "12px" }}>
              <span style={{ background: statusColors[app.status], color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>
                {app.status}
              </span>
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Applied", "Interview", "Offer", "Rejected"].map((status) => (
                <button key={status} onClick={() => updateStatus(app.id, status)}
                  style={{ padding: "4px 10px", fontSize: "12px", cursor: "pointer",
                    backgroundColor: app.status === status ? statusColors[status] : "#f0f0f0",
                    color: app.status === status ? "white" : "#333",
                    border: "none", borderRadius: "6px" }}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}