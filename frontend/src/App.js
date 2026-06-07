import { useState } from "react";
import Auth from "./Auth";
import Opportunities from "./opportunities";
import Applications from "./Applications";
import Dashboard from "./Dashboard";
import Profile from "./Profile";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [page, setPage] = useState("opportunities");

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
  };

  if (!role) {
    return <Auth onLogin={handleLogin} />;
  }

  const navBtn = (label, pageName) => (
    <button onClick={() => setPage(pageName)}
      style={{ padding: "8px 16px",
        backgroundColor: page === pageName ? "white" : "transparent",
        color: page === pageName ? "#4F46E5" : "white",
        border: "1px solid white", borderRadius: "8px", cursor: "pointer" }}>
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "Arial", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ background: "#4F46E5", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "white", margin: 0 }}>🎓 InternTrack</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {navBtn("Opportunities", "opportunities")}
          {role === "student" && navBtn("My Applications", "applications")}
          {navBtn("Dashboard", "dashboard")}
          {navBtn("Profile", "profile")}
          <span style={{ color: "white" }}>👤 {localStorage.getItem("name")} ({role})</span>
          <button onClick={handleLogout}
            style={{ padding: "8px 16px", backgroundColor: "white", color: "#4F46E5", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {page === "opportunities" && <Opportunities />}
      {page === "applications" && <Applications />}
      {page === "dashboard" && <Dashboard />}
      {page === "profile" && <Profile />}
    </div>
  );
}

export default App;