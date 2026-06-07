import { useState } from "react";
import Auth from "./Auth";
import Opportunities from "./opportunities";
import Applications from "./Applications";

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

  return (
    <div style={{ fontFamily: "Arial" }}>
      <div style={{ background: "#4F46E5", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "white", margin: 0 }}>🎓 InternTrack</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => setPage("opportunities")}
            style={{ padding: "8px 16px", backgroundColor: page === "opportunities" ? "white" : "transparent",
              color: page === "opportunities" ? "#4F46E5" : "white", border: "1px solid white", borderRadius: "8px", cursor: "pointer" }}>
            Opportunities
          </button>
          {role === "student" && (
            <button onClick={() => setPage("applications")}
              style={{ padding: "8px 16px", backgroundColor: page === "applications" ? "white" : "transparent",
                color: page === "applications" ? "#4F46E5" : "white", border: "1px solid white", borderRadius: "8px", cursor: "pointer" }}>
              My Applications
            </button>
          )}
          <span style={{ color: "white" }}>👤 {localStorage.getItem("name")} ({role})</span>
          <button onClick={handleLogout}
            style={{ padding: "8px 16px", backgroundColor: "white", color: "#4F46E5", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {page === "opportunities" && <Opportunities />}
      {page === "applications" && <Applications />}
    </div>
  );
}

export default App;