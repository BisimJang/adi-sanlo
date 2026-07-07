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
    <div className="min-h-screen bg-bg flex">
      {/* Left side - Adire Pattern Cover */}
      {/* Left side - Adire Pattern Cover */}
      <div className="hidden lg:flex flex-col justify-center w-[45%] relative overflow-hidden bg-ink p-12">
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ 
            backgroundImage: 'url(/adire-pattern.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink/90" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-6 mb-12">
          <div className="w-16 h-16 rounded bg-accent text-bg flex items-center justify-center font-bold text-4xl shadow-lg">
            A
          </div>
          <span className="font-bold text-white text-5xl tracking-tight">Àdí-Sànló</span>
        </div>

        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
            Built for Nigerian software with recurring revenue.
          </h2>
          <p className="text-[#a9bbe0] text-lg max-w-md mx-auto">
            Bind once. Get paid every cycle. Manage your entire subscription lifecycle on top of Nomba's payment primitives.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded bg-accent text-bg flex items-center justify-center font-bold text-lg">
              A
            </div>
            <span className="font-bold text-ink text-xl tracking-tight">Àdí-Sànló</span>
          </div>
          
          <div className="bg-white rounded-[8px] border border-blue-500/40 p-8 shadow-[0_4px_24px_rgba(59,130,246,0.08)]">
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
                  placeholder="chike@mail.com"
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

            <p className="mt-6 text-center text-[13.5px] text-indigo-mid">
              Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">Log in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
