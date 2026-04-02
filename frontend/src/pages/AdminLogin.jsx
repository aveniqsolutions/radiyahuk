import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      localStorage.setItem("admin_token", res.data.token);
      toast.success("Logged in successfully.");
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="w-full max-w-sm" data-testid="admin-login-page">
        <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-2 text-center">
          Admin Access
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] text-[#737373] text-center mb-10">
          Radiyah UK Dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
              Email
            </label>
            <input
              type="email"
              data-testid="admin-email-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-3 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
              placeholder="admin@radiyah.co.uk"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
              Password
            </label>
            <input
              type="password"
              data-testid="admin-password-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-3 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            data-testid="admin-login-button"
            disabled={loading}
            className="w-full bg-white text-black py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
