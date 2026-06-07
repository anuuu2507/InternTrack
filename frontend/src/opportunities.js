import { useState, useEffect } from "react";
import axios from "axios";

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState({ title: "", company: "", stipend: "", deadline: "", description: "" });
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    const res = await axios.get("http://127.0.0.1:5000/api/opportunities");
    setOpportunities(res.data);
  };

  const handlePost = async () => {
    await axios.post("http://127.0.0.1:5000/api/opportunities", form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Opportunity posted!");
    fetchOpportunities();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#4F46E5" }}>Internship Opportunities</h2>

      {(role === "faculty" || role === "admin") && (
        <div style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem" }}>
          <h3>Post New Opportunity</h3>
          {["title", "company", "stipend", "deadline", "description"].map((field) => (
            <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }} />
          ))}
          <button onClick={handlePost}
            style={{ padding: "10px 24px", backgroundColor: "#4F46E5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Post Opportunity
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {opportunities.length === 0 && <p>No opportunities posted yet.</p>}
        {opportunities.map((opp) => (
          <div key={opp.id} style={{ background: "white", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: "#4F46E5", margin: "0 0 8px" }}>{opp.title}</h3>
            <p style={{ margin: "4px 0" }}><strong>Company:</strong> {opp.company}</p>
            <p style={{ margin: "4px 0" }}><strong>Stipend:</strong> {opp.stipend}</p>
            <p style={{ margin: "4px 0" }}><strong>Deadline:</strong> {opp.deadline}</p>
            <p style={{ margin: "8px 0", color: "#666" }}>{opp.description}</p>
            {role === "student" && (
              <button onClick={async () => {
                try {
                  await axios.post("http://127.0.0.1:5000/api/apply",
                    { opportunity_id: opp.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  alert("Applied successfully!");
                } catch (err) {
                  alert(err.response?.data?.message || "Something went wrong!");
                }
              }}
                style={{ marginTop: "12px", padding: "8px 16px", backgroundColor: "#4F46E5",
                  color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                Apply
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}