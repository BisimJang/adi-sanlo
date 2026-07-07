import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export function Signup() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use raw fetch because api() might be missing the auth header at this point
      const res = await fetch("https://adi-sanlo-production.up.railway.app/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          business_name: businessName,
          email: email,
          password: password 
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create account");
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
          <h1 className="text-[20px] font-bold text-ink mb-2">Create Developer Account</h1>
          <p className="text-[13.5px] text-indigo-mid mb-6">
            Sign up to get your API keys and start billing.
          </p>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {error && (
              <div className="bg-[#b83232]/10 text-[#b83232] text-[13px] p-3 rounded-[4px] border border-[#b83232]/20">
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-ink">Business / App Name</label>
              <input 
                type="text" 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Studyverse"
                required
                className="border border-border rounded-[4px] px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-ink">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="border border-border rounded-[4px] px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-ink">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border border-border rounded-[4px] px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
