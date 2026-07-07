import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("adi_sanlo_api_key"));
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-[rgba(255,255,255,0.92)] backdrop-blur-md border-b border-[rgba(19,27,46,0.09)]">
        <div className="max-w-[1120px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-[9px] font-bold text-[18px] tracking-[-0.01em]">
            <span className="w-2 h-2 bg-accent inline-block"></span>
            Adi&#8209;Sanlo
          </div>
          <div className="hidden md:flex gap-8 text-[14px] text-indigo-deep">
            <a href="#features" className="opacity-70 hover:opacity-100 transition-opacity">Product</a>
            <a href="#usecases" className="opacity-70 hover:opacity-100 transition-opacity">Use cases</a>
            <a href="#api" className="opacity-70 hover:opacity-100 transition-opacity">API</a>
            {isLoggedIn && <Link to="/dashboard" className="opacity-70 hover:opacity-100 transition-opacity">Dashboard</Link>}
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  localStorage.removeItem("adi_sanlo_api_key");
                  localStorage.removeItem("adi_sanlo_tenant_id");
                  window.location.reload();
                }} 
                className="font-mono text-[13px] font-medium text-ink hover:text-[#b83232] transition-colors"
              >
                Log out
              </button>
              <Link to="/dashboard" className="font-mono text-[12.5px] font-medium bg-ink text-white px-[18px] py-[10px] rounded-[3px] border border-ink hover:bg-transparent hover:text-ink transition-colors">
                Open dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-mono text-[13px] font-medium text-ink hover:text-indigo-600 transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="font-mono text-[12.5px] font-medium bg-ink text-white px-[18px] py-[10px] rounded-[3px] border border-ink hover:bg-transparent hover:text-ink transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="bg-white pt-[120px] pb-[96px] border-b border-[rgba(19,27,46,0.08)] overflow-hidden">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-indigo-mid flex items-center gap-[10px] before:content-[''] before:w-[14px] before:h-[2px] before:bg-accent before:inline-block">
                Recurring billing infrastructure
              </div>
              <h1 className="text-[clamp(42px,5.2vw,68px)] leading-[1.02] mt-6 mb-[26px] text-ink">
                Bind once.<br/>Get paid <span className="text-accent">every cycle</span>.
              </h1>
              <p className="text-[17px] leading-[1.65] text-indigo-mid mb-[38px]">
                Adi&#8209;Sanlo is a managed subscription layer built on Nomba's payment primitives. Tokenised cards, mandates, dunning and webhooks are handled for you, so your AI SaaS or EdTech product just gets paid.
              </p>
              <div className="flex flex-wrap gap-[14px]">
                {isLoggedIn ? (
                  <Link to="/dashboard" className="font-mono text-[13.5px] font-medium px-6 py-3.5 bg-accent text-ink rounded-[3px] hover:-translate-y-[1px] hover:bg-[#c9962e] transition-all">
                    Open dashboard
                  </Link>
                ) : (
                  <Link to="/signup" className="font-mono text-[13.5px] font-medium px-6 py-3.5 bg-accent text-ink rounded-[3px] hover:-translate-y-[1px] hover:bg-[#c9962e] transition-all">
                    Get Started
                  </Link>
                )}
                <Link to="/docs" className="font-mono text-[13.5px] font-medium px-6 py-3.5 bg-transparent border border-[rgba(19,27,46,0.22)] text-ink rounded-[3px] hover:border-ink transition-colors">
                  Read the docs
                </Link>
              </div>
            </div>

            {/* Right: Mini dashboard preview */}
            <div className="relative">
              {/* Glow behind the card */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-indigo-mid/10 rounded-[12px] blur-3xl scale-110 -z-10" />
              <div className="bg-white border border-[rgba(16,25,46,0.12)] rounded-[8px] shadow-[0_8px_40px_rgba(16,25,46,0.10)] overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-[6px] px-4 py-3 border-b border-[rgba(16,25,46,0.08)] bg-[#f9fafb]">
                  <span className="w-[10px] h-[10px] rounded-full bg-[#e3a93a]"></span>
                  <span className="w-[10px] h-[10px] rounded-full bg-[rgba(16,25,46,0.12)]"></span>
                  <span className="w-[10px] h-[10px] rounded-full bg-[rgba(16,25,46,0.12)]"></span>
                  <span className="ml-3 font-mono text-[11px] text-indigo-mid">adi-sanlo / dashboard</span>
                </div>
                {/* Metric row */}
                <div className="grid grid-cols-3 border-b border-[rgba(16,25,46,0.08)]">
                  {[
                    { label: 'MRR', value: '₦2.8M', delta: '+18%', up: true },
                    { label: 'Subscribers', value: '847', delta: '+34', up: true },
                    { label: 'Churn', value: '2.4%', delta: '-0.8%', up: false },
                  ].map((m, i) => (
                    <div key={i} className={`p-4 ${i < 2 ? 'border-r border-[rgba(16,25,46,0.08)]' : ''}`}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-indigo-mid">{m.label}</div>
                      <div className="text-[20px] font-bold text-ink mt-1 leading-none">{m.value}</div>
                      <div className={`font-mono text-[11px] mt-1 ${m.up ? 'text-[#1a9c5e]' : 'text-[#b83232]'}`}>{m.delta}</div>
                    </div>
                  ))}
                </div>
                {/* Activity feed */}
                <div className="p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-indigo-mid mb-3">Recent Activity</div>
                  {[
                    { event: 'invoice.paid', amount: '₦5,000', status: 'paid', color: 'bg-[#1a9c5e]' },
                    { event: 'subscription.activated', amount: '₦15,000', status: 'active', color: 'bg-[#1a9c5e]' },
                    { event: 'charge.failed', amount: '₦3,000', status: 'failed', color: 'bg-[#b83232]' },
                    { event: 'mandate.active', amount: '₦8,500', status: 'active', color: 'bg-[#1a9c5e]' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 py-[9px] border-b border-[rgba(16,25,46,0.06)] last:border-0">
                      <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${row.color}`}></span>
                      <span className="text-[12.5px] text-ink font-medium flex-1">{row.event}</span>
                      <span className="font-mono text-[11.5px] text-indigo-mid">{row.amount}</span>
                      <span className={`font-mono text-[10px] px-2 py-[3px] rounded-[3px] uppercase tracking-[0.04em] ${
                        row.status === 'paid' || row.status === 'active'
                          ? 'bg-[rgba(26,156,94,0.08)] text-[#1a9c5e]'
                          : 'bg-[rgba(184,50,50,0.07)] text-[#b83232]'
                      }`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-[104px]" id="features">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[580px] mb-[60px]">
            <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-indigo-mid flex items-center gap-[10px] before:content-[''] before:w-[14px] before:h-[2px] before:bg-accent before:inline-block">Four ways to bill</div>
            <h2 className="text-[clamp(28px,3.4vw,38px)] mt-4 text-ink">One integration, every billing shape.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] bg-white border border-[rgba(16,25,46,0.15)]">
            <div className="bg-white p-[40px] px-[36px] flex flex-col justify-between gap-5 min-h-[230px]">
              <svg className="w-[52px] h-[52px]" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="11" stroke="#10192e" strokeWidth="1.6"/>
                <ellipse cx="12" cy="12" rx="12" ry="5" stroke="#10192e" strokeWidth="1.4" transform="rotate(45 12 12)"/>
                <ellipse cx="48" cy="12" rx="12" ry="5" stroke="#10192e" strokeWidth="1.4" transform="rotate(-45 48 12)"/>
                <ellipse cx="12" cy="48" rx="12" ry="5" stroke="#10192e" strokeWidth="1.4" transform="rotate(-45 12 48)"/>
                <ellipse cx="48" cy="48" rx="12" ry="5" stroke="#10192e" strokeWidth="1.4" transform="rotate(45 48 48)"/>
              </svg>
              <div>
                <span className="font-mono text-[11px] tracking-[0.08em] text-indigo-mid uppercase font-medium">01 &middot; Flat rate</span>
                <h3 className="text-[19px] font-semibold text-ink mb-2 mt-1">Fixed subscriptions</h3>
                <p className="text-[14px] leading-[1.55] text-indigo-mid m-0">Weekly, monthly or annual plans with proration, upgrades and free trials handled automatically.</p>
              </div>
            </div>
            <div className="bg-ink p-[40px] px-[36px] flex flex-col justify-between gap-5 min-h-[230px]">
              <svg className="w-[52px] h-[52px]" viewBox="0 0 60 60" fill="none">
                <g stroke="#ffffff" strokeWidth="1.4">
                  <ellipse cx="30" cy="14" rx="5" ry="13"/>
                  <ellipse cx="30" cy="46" rx="5" ry="13"/>
                  <ellipse cx="14" cy="30" rx="13" ry="5"/>
                  <ellipse cx="46" cy="30" rx="13" ry="5"/>
                  <ellipse cx="19" cy="19" rx="5" ry="13" transform="rotate(45 19 19)"/>
                  <ellipse cx="41" cy="41" rx="5" ry="13" transform="rotate(45 41 41)"/>
                  <ellipse cx="41" cy="19" rx="5" ry="13" transform="rotate(-45 41 19)"/>
                  <ellipse cx="19" cy="41" rx="5" ry="13" transform="rotate(-45 19 41)"/>
                </g>
                <circle cx="30" cy="30" r="3.5" fill="#e3a93a"/>
              </svg>
              <div>
                <span className="font-mono text-[11px] tracking-[0.08em] text-white uppercase font-medium">02 &middot; Metered</span>
                <h3 className="text-[19px] font-semibold text-white mb-2 mt-1">Usage-based billing</h3>
                <p className="text-[14px] leading-[1.55] text-[#a9bbe0] m-0">Meter API calls, tokens or seats, and settle the bill at the end of each cycle. No manual invoicing.</p>
              </div>
            </div>
            <div className="bg-white p-[40px] px-[36px] flex flex-col justify-between gap-5 min-h-[230px]">
              <svg className="w-[52px] h-[52px]" viewBox="0 0 60 60" fill="none">
                <g stroke="#10192e" strokeWidth="1.3">
                  <circle cx="20" cy="20" r="11"/><circle cx="20" cy="20" r="7"/><circle cx="20" cy="20" r="3"/>
                  <circle cx="44" cy="20" r="7"/><circle cx="44" cy="20" r="3.5"/>
                  <circle cx="20" cy="44" r="7"/><circle cx="20" cy="44" r="3.5"/>
                  <circle cx="44" cy="44" r="11"/><circle cx="44" cy="44" r="7"/><circle cx="44" cy="44" r="3"/>
                </g>
              </svg>
              <div>
                <span className="font-mono text-[11px] tracking-[0.08em] text-indigo-mid uppercase font-medium">03 &middot; Prepaid</span>
                <h3 className="text-[19px] font-semibold text-ink mb-2 mt-1">Credit packs</h3>
                <p className="text-[14px] leading-[1.55] text-indigo-mid m-0">Sell top-up bundles that draw down with usage, and auto-prompt a refill when balance runs low.</p>
              </div>
            </div>
            <div className="bg-ink p-[40px] px-[36px] flex flex-col justify-between gap-5 min-h-[230px]">
              <svg className="w-[52px] h-[52px]" viewBox="0 0 60 60" fill="none">
                <g stroke="#ffffff" strokeWidth="2.4">
                  <line x1="-5" y1="60" x2="15" y2="0"/>
                  <line x1="10" y1="60" x2="30" y2="0"/>
                  <line x1="25" y1="60" x2="45" y2="0"/>
                  <line x1="40" y1="60" x2="60" y2="0"/>
                  <line x1="55" y1="60" x2="75" y2="0"/>
                </g>
              </svg>
              <div>
                <span className="font-mono text-[11px] tracking-[0.08em] text-white uppercase font-medium">04 &middot; Any method</span>
                <h3 className="text-[19px] font-semibold text-white mb-2 mt-1">Cards &amp; direct debit</h3>
                <p className="text-[14px] leading-[1.55] text-[#a9bbe0] m-0">Tokenised cards for one-tap renewal, or bank mandates for lower-fee recurring debits, on the same API.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-[104px] border-t border-[rgba(16,25,46,0.1)]" id="usecases">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="max-w-[580px] mb-[56px]">
            <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-indigo-mid flex items-center gap-[10px] before:content-[''] before:w-[14px] before:h-[2px] before:bg-accent before:inline-block">Who it's for</div>
            <h2 className="text-[clamp(28px,3.4vw,38px)] mt-4 text-ink">Built for Nigerian software with recurring revenue.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[rgba(16,25,46,0.15)] border border-[rgba(16,25,46,0.15)]">
            <div className="bg-white p-[40px] px-[36px] flex flex-col gap-4">
              <span className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase font-medium">AI SaaS</span>
              <h3 className="text-[20px] font-semibold text-ink m-0">Metered API and token usage</h3>
              <p className="text-[14.5px] leading-[1.6] text-indigo-mid m-0">Charge for what gets consumed. Meter API calls, tokens, or compute time, and settle automatically at the end of each billing cycle.</p>
              <div className="font-mono text-[12px] text-indigo-mid border-t border-[rgba(16,25,46,0.1)] pt-[14px] mt-auto">Maps to <strong className="text-ink font-medium">usage-based billing</strong></div>
            </div>
            <div className="bg-white p-[40px] px-[36px] flex flex-col gap-4">
              <span className="font-mono text-[11px] tracking-[0.08em] text-accent uppercase font-medium">EdTech</span>
              <h3 className="text-[20px] font-semibold text-ink m-0">Course and cohort subscriptions</h3>
              <p className="text-[14.5px] leading-[1.6] text-indigo-mid m-0">Run monthly or termly access to courses and cohorts, with trials, proration, and renewals handled without manual follow-up.</p>
              <div className="font-mono text-[12px] text-indigo-mid border-t border-[rgba(16,25,46,0.1)] pt-[14px] mt-auto">Maps to <strong className="text-ink font-medium">flat-rate subscriptions</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-[104px] text-white" id="api">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-[56px] items-center">
            <div>
              <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-[#a9bbe0] flex items-center gap-[10px] before:content-[''] before:w-[14px] before:h-[2px] before:bg-accent before:inline-block">Integrate in minutes</div>
              <h2 className="text-[clamp(26px,3vw,34px)] my-4 text-white">Bind a customer, get a subscription.</h2>
              <p className="text-[#a9bbe0] text-[15px] leading-[1.65] max-w-[420px]">Adi&#8209;Sanlo wraps Nomba's tokenisation and mandate flows in a single call. Webhooks, retries and dunning are handled on our side, and your app just listens for status changes.</p>
            </div>
            <div className="bg-[#0c1220] rounded-[6px] border border-[rgba(255,255,255,0.1)] overflow-hidden">
              <div className="flex gap-[7px] p-[12px] px-[16px] border-b border-[rgba(255,255,255,0.08)]">
                <span className="w-[9px] h-[9px] rounded-full bg-indigo-deep"></span>
                <span className="w-[9px] h-[9px] rounded-full bg-indigo-deep"></span>
                <span className="w-[9px] h-[9px] rounded-full bg-indigo-deep"></span>
              </div>
              <pre className="m-0 p-[24px] px-[22px] font-mono text-[13px] leading-[1.7] overflow-x-auto text-[#dbe3f4]">
                <span className="text-[#7284a3]"># create a subscription</span>{`
curl -X POST https://api.adisanlo.dev/v1/subscriptions \\
  -H "Authorization: Bearer `}<span className="text-accent">sk_live_...</span>{`" \\
  -d customer_email=`}<span className="text-accent">chidi@startup.ng</span>{` \\
  -d plan_id=`}<span className="text-accent">plan_pro_monthly</span>{`

`}<span className="text-[#7284a3]"># response</span>{`
{
  `}<span className="text-[#9fd8b0]">"status"</span>{`: `}<span className="text-[#9fd8b0]">"incomplete"</span>{`,
  `}<span className="text-[#9fd8b0]">"checkout_url"</span>{`: `}<span className="text-[#9fd8b0]">"https://checkout.nomba.com/..."</span>{`,
  `}<span className="text-[#9fd8b0]">"subscription_id"</span>{`: `}<span className="text-[#9fd8b0]">"sub_2fL9xk"</span>{`
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-[112px] text-center">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-indigo-mid flex items-center justify-center gap-[10px] before:content-[''] before:w-[14px] before:h-[2px] before:bg-accent before:inline-block">Ready when you are</div>
          <h2 className="text-[clamp(32px,4.2vw,48px)] mt-[18px] text-ink">Stop rebuilding billing.<br/>Bind. Pay. Go.</h2>
          <p className="text-indigo-mid my-[18px] mb-[32px] text-[15.5px]">Free while in Build Phase. Full docs and API reference coming soon.</p>
          {isLoggedIn ? (
            <Link to="/dashboard" className="font-mono text-[13.5px] font-medium px-6 py-3.5 bg-accent text-ink rounded-[3px] hover:-translate-y-[1px] hover:bg-[#c9962e] transition-all inline-block">
              Open dashboard
            </Link>
          ) : (
            <Link to="/signup" className="font-mono text-[13.5px] font-medium px-6 py-3.5 bg-accent text-ink rounded-[3px] hover:-translate-y-[1px] hover:bg-[#c9962e] transition-all inline-block">
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-[#a9bbe0] pt-[80px]">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-[40px] pb-[56px] border-b border-[rgba(255,255,255,0.1)]">
            <div>
              <div className="flex items-center gap-[9px] font-bold text-[18px] tracking-[-0.01em] text-white mb-[14px]">
                <span className="w-2 h-2 bg-accent inline-block"></span>
                Adi&#8209;Sanlo
              </div>
              <p className="text-[14px] leading-[1.6] text-[#8fa0c9] max-w-[260px] m-0">A managed recurring billing layer on top of Nomba's payment primitives, for Nigerian developers building AI SaaS and EdTech products.</p>
            </div>
            <div>
              <h4 className="font-mono text-[11.5px] tracking-[0.1em] uppercase text-[#7284a3] m-0 mb-[18px] font-medium">Product</h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-[12px]">
                <li><a href="#features" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Billing types</a></li>
                <li><a href="#usecases" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Use cases</a></li>
                <li><a href="#api" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11.5px] tracking-[0.1em] uppercase text-[#7284a3] m-0 mb-[18px] font-medium">Dashboard</h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-[12px]">
                <li><Link to="/dashboard" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Overview</Link></li>
                <li><Link to="/subscribers" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Subscribers</Link></li>
                <li><Link to="/invoices" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Invoices</Link></li>
                <li><Link to="/webhook-logs" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Webhook logs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono text-[11.5px] tracking-[0.1em] uppercase text-[#7284a3] m-0 mb-[18px] font-medium">Company</h4>
              <ul className="list-none m-0 p-0 flex flex-col gap-[12px]">
                <li><a href="#" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-[14px] text-[#c3cde4] hover:text-white transition-colors">Jos, Nigeria</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-between items-center flex-wrap gap-[14px] py-6 mt-0">
            <div className="font-mono text-[12px] text-[#7284a3]">&copy; 2026 Adi&#8209;Sanlo &middot; built on Nomba &middot; FastAPI + SQLite</div>
            <div className="flex gap-[22px]">
              <a href="#" className="text-[12.5px] text-[#7284a3] hover:text-white">Privacy</a>
              <a href="#" className="text-[12.5px] text-[#7284a3] hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
