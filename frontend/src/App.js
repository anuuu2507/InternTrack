import { useState } from "react";
import Auth from "./Auth";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  if (!role) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h2>Welcome to InternTrack! 🎉</h2>
      <p>Logged in as: <strong>{role}</strong></p>
      <button onClick={() => { localStorage.clear(); setRole(null); }}
        style={{ padding: "8px 16px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
}

export default App;