import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [profile, setProfile] = useState({ id: "", name: "", email: "", role: "" });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFormData({ name: res.data.name, email: res.data.email });
    } catch (err) {
      setMessage("Failed to load profile");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setMessage("Name and email are required!");
      return;
    }
    try {
      const res = await axios.put("http://127.0.0.1:5000/api/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEditMode(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      // Update localStorage name
      localStorage.setItem("name", res.data.name);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({ name: profile.name, email: profile.email });
    setEditMode(false);
    setMessage("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#4F46E5" }}>👤 My Profile</h2>

      {message && (
        <div style={{ 
          padding: "12px", 
          marginBottom: "1.5rem", 
          borderRadius: "8px",
          backgroundColor: message.includes("successfully") ? "#D1FAE5" : "#FEE2E2",
          color: message.includes("successfully") ? "#065F46" : "#991B1B",
          border: message.includes("successfully") ? "1px solid #A7F3D0" : "1px solid #FECACA"
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        backgroundColor: "#f9f9f9", 
        padding: "2rem", 
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        {!editMode ? (
          // View Mode
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>User ID</label>
              <p style={{ margin: "4px 0", fontSize: "16px", color: "#333" }}>{profile.id}</p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>Name</label>
              <p style={{ margin: "4px 0", fontSize: "16px", color: "#333" }}>{profile.name}</p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>Email</label>
              <p style={{ margin: "4px 0", fontSize: "16px", color: "#333" }}>{profile.email}</p>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontSize: "12px", color: "#666", fontWeight: "bold" }}>Role</label>
              <p style={{ 
                margin: "4px 0", 
                fontSize: "16px", 
                color: "white",
                backgroundColor: profile.role === "student" ? "#4F46E5" : profile.role === "faculty" ? "#10B981" : "#8B5CF6",
                padding: "6px 12px",
                borderRadius: "6px",
                display: "inline-block"
              }}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </p>
            </div>

            <button onClick={() => setEditMode(true)}
              style={{
                padding: "10px 24px",
                backgroundColor: "#4F46E5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}>
              Edit Profile
            </button>
          </>
        ) : (
          // Edit Mode
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>Name</label>
              <input type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                  fontSize: "14px"
                }} />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>Email</label>
              <input type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                  fontSize: "14px"
                }} />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={handleSave}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#10B981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}>
                Save Changes
              </button>
              <button onClick={handleCancel}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#EF4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* User Statistics */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ color: "#4F46E5", marginBottom: "1rem" }}>Profile Summary</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "12px"
        }}>
          <div style={{
            backgroundColor: "#E0E7FF",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#666" }}>Status</p>
            <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold", color: "#4F46E5" }}>Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
