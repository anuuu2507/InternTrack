import { useState } from "react";
import Auth from "./Auth";
import Opportunities from "./opportunities";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

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
          <span style={{ color: "white" }}>👤 {localStorage.getItem("name")} ({role})</span>
          <button onClick={handleLogout}
            style={{ padding: "8px 16px", backgroundColor: "white", color: "#4F46E5", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>
      <Opportunities />
    </div>
  );
}

export default App;