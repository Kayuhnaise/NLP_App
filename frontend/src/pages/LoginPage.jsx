import React from "react";
import "./LoginPage.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function LoginPage() {
  const handleGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleFacebook = () => {
    window.location.href = `${API_BASE}/auth/facebook`;
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome</h1>
        <p className="subtitle">Please log in to continue</p>

        <button className="google-btn" onClick={handleGoogle}>
          Continue with Google
        </button>

        <button className="facebook-btn" onClick={handleFacebook}>
          Continue with Facebook
        </button>
      </div>
    </div>
  );
}

