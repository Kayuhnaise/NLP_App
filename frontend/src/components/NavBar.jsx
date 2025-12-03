import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function NavBar() {
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "GET",
        credentials: "include",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <nav className="navbar-modern">
      <div className="left">
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <button className="logout-modern" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
