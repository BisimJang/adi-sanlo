import { useState, useEffect } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

export function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKey(localStorage.getItem("adi_sanlo_api_key") || "");
    setTenantId(localStorage.getItem("adi_sanlo_tenant_id") || "");
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink tracking-tight mb-2">Developer Settings</h1>
        <p className="text-[#5f6e8a] text-[14px]">
          Manage your API keys and integration settings.
        </p>
      </div>

      <div className="glass rounded-[12px] p-8 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-6">API Keys</h2>
        
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-[13px] font-medium text-indigo-mid mb-2">
              Secret API Key
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="w-full bg-[#f4f7fa] border border-border rounded-[6px] px-4 py-2.5 text-[14px] text-ink font-mono focus:outline-none"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-mid hover:text-ink transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-[6px] text-[13.5px] font-medium transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[12.5px] text-[#8fa0c9] mt-2">
              Use this key to authenticate API requests. Do not share it in publicly accessible code like frontend applications.
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <label className="block text-[13px] font-medium text-indigo-mid mb-2">
              Tenant ID
            </label>
            <input
              type="text"
              value={tenantId}
              readOnly
              className="w-full bg-[#f4f7fa] border border-border rounded-[6px] px-4 py-2.5 text-[14px] text-[#5f6e8a] font-mono focus:outline-none opacity-80"
            />
            <p className="text-[12.5px] text-[#8fa0c9] mt-2">
              Your unique account identifier. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
