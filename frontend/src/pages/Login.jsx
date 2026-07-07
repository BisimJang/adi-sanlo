import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://adi-sanlo-production.up.railway.app/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Invalid email or password");
      }

      const data = await res.json();

      // Save API Key to localStorage
      localStorage.setItem("adi_sanlo_api_key", data.api_key);
      localStorage.setItem("adi_sanlo_tenant_id", data.tenant_id);
      
      // Redirect to dashboard
      navigate("/");
      // Force reload to apply API key globally
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded bg-accent text-bg flex items-center justify-center font-bold text-lg">
            A
          </div>
          <span className="font-bold text-ink text-xl tracking-tight">Adi-Sanlo</span>
        </div>
        
        <div className="bg-white rounded-[8px] border border-border p-8 shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-2">Welcome Back</h2>
          <p className="text-indigo-mid text-[14px] mb-6">Enter your email and password to access your dashboard.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-indigo-deep mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-[#f4f7fa] border border-border rounded-[6px] px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-indigo-deep mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#f4f7fa] border border-border rounded-[6px] px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
              />
            </div>

            {error && (
              <div className="text-[#b83232] text-[13px] bg-[#b83232]/10 p-3 rounded-[6px] border border-[#b83232]/20">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13.5px] text-indigo-mid">
            Don't have an account? <button onClick={() => navigate("/signup")} className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}
