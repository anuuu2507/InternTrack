import { useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const res = await axios.post("http://127.0.0.1:5000/api/login", {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        onLogin(res.data.role);
      } else {
        await axios.post("http://127.0.0.1:5000/api/register", form);
        alert("Registered successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "2rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px", fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        {isLogin ? "Login to InternTrack" : "Register to InternTrack"}
      </h2>

      {!isLogin && (
        <input name="name" placeholder="Full Name" onChange={handleChange}
          style={inputStyle} />
      )}
      <input name="email" placeholder="Email" onChange={handleChange}
        style={inputStyle} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange}
        style={inputStyle} />

      {!isLogin && (
        <select name="role" onChange={handleChange} style={inputStyle}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
      )}

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <button onClick={handleSubmit} style={buttonStyle}>
        {isLogin ? "Login" : "Register"}
      </button>

      <p style={{ textAlign: "center", marginTop: "1rem", cursor: "pointer", color: "#4F46E5" }}
        onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
      </p>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px", marginBottom: "1rem",
  borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%", padding: "12px", backgroundColor: "#4F46E5",
  color: "white", border: "none", borderRadius: "8px",
  fontSize: "16px", cursor: "pointer"
};