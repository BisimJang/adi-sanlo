import { BookOpen, Key, Link as LinkIcon, RefreshCw } from "lucide-react";

export function Docs() {
  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink tracking-tight mb-2">API Documentation</h1>
        <p className="text-[#5f6e8a] text-[14px]">
          Integrate the Adi-Sanlo billing engine into your client application (e.g., Studyverse).
        </p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Authentication Section */}
        <section className="glass rounded-[12px] p-8 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <Key size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">Authentication</h2>
          </div>
          <p className="text-[14px] text-indigo-mid mb-4">
            All API requests must be authenticated by passing your Secret API Key in the <code className="bg-[#f4f7fa] px-1.5 py-0.5 rounded text-ink border border-border">Authorization</code> header. 
            You can find your API key on the Settings page.
          </p>
          <div className="bg-[#0f1117] rounded-[8px] p-4 font-mono text-[13px] text-[#e2e8f0] overflow-x-auto">
            Authorization: Bearer sk_live_your_api_key_here
          </div>
        </section>

        {/* 1. Fetch Plans */}
        <section className="glass rounded-[12px] p-8 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <LinkIcon size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">1. Fetch Available Plans</h2>
          </div>
          <p className="text-[14px] text-indigo-mid mb-4">
            Fetch all active billing plans created in your dashboard to dynamically display them on your pricing page.
          </p>
          <div className="mb-4">
            <span className="bg-green-100 text-green-700 font-mono text-[12px] px-2 py-1 rounded font-bold mr-3">GET</span>
            <code className="text-[14px] text-ink font-mono bg-white border px-2 py-1 rounded">/v1/plans</code>
          </div>
          <div className="bg-[#0f1117] rounded-[8px] p-4 font-mono text-[13px] text-[#e2e8f0] overflow-x-auto">
<pre>{`[
  {
    "id": "plan_12345",
    "name": "Pro Monthly",
    "amount": 500000, 
    "interval": "monthly",
    "description": "Full access to all courses."
  }
]`}</pre>
          </div>
          <p className="text-[12px] text-indigo-mid mt-3 italic">Note: amount is in kobo. Divide by 100 to get the Naira value.</p>
        </section>

        {/* 2. Create Subscription */}
        <section className="glass rounded-[12px] p-8 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">2. Create a Subscription & Checkout</h2>
          </div>
          <p className="text-[14px] text-indigo-mid mb-4">
            When a user clicks "Subscribe" on your frontend, call this endpoint to create their subscription and generate a Nomba payment link.
          </p>
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-700 font-mono text-[12px] px-2 py-1 rounded font-bold mr-3">POST</span>
            <code className="text-[14px] text-ink font-mono bg-white border px-2 py-1 rounded">/v1/subscriptions</code>
          </div>
          <h4 className="text-[13px] font-bold text-ink mb-2">Request Body</h4>
          <div className="bg-[#0f1117] rounded-[8px] p-4 font-mono text-[13px] text-[#e2e8f0] overflow-x-auto mb-4">
<pre>{`{
  "plan_id": "plan_12345",
  "customer_email": "student@studyverse.com",
  "customer_name": "Emeka Okafor",
  "callback_url": "https://your-app.com/payment-success"
}`}</pre>
          </div>
          <h4 className="text-[13px] font-bold text-ink mb-2">Response</h4>
          <div className="bg-[#0f1117] rounded-[8px] p-4 font-mono text-[13px] text-[#e2e8f0] overflow-x-auto">
<pre>{`{
  "subscription_id": "sub_67890",
  "invoice_id": "inv_11111",
  "status": "incomplete",
  "checkout_url": "https://checkout.nomba.com/..."
}`}</pre>
          </div>
          <p className="text-[13px] text-indigo-mid mt-4">
            <strong>Next Step:</strong> Redirect the user's browser to the <code className="font-mono bg-slate-100 px-1 rounded">checkout_url</code>. Once they pay, Nomba will redirect them back to your <code className="font-mono bg-slate-100 px-1 rounded">callback_url</code>.
          </p>
        </section>

        {/* 3. Automatic Billing */}
        <section className="glass rounded-[12px] p-8 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg">
              <RefreshCw size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">3. Automatic Recurring Billing</h2>
          </div>
          <p className="text-[14px] text-indigo-mid mb-4">
            You do not need to write any code to handle renewals!
          </p>
          <ul className="list-disc pl-5 text-[14px] text-indigo-mid space-y-2">
            <li>When the <code className="font-mono bg-slate-100 px-1 rounded">current_period_end</code> date is reached, the Adi-Sanlo backend automatically wakes up and charges the user's tokenized card via Nomba.</li>
            <li>If successful, the period is extended by 1 month.</li>
            <li>If it fails, the status changes to <code className="font-mono bg-slate-100 px-1 rounded text-amber-600">past_due</code> and you will see the failed charge in your Invoices dashboard.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
