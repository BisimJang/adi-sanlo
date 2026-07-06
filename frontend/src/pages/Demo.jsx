import { useState, useEffect } from "react";

export function Demo() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    // Fetch plans using the API Key (Simulating a real client app)
    const apiKey = localStorage.getItem("adi_sanlo_api_key");
    if (!apiKey) {
      alert("Please Sign Up to generate an API key first.");
      return;
    }

    fetch("https://adi-sanlo-production.up.railway.app/v1/plans", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = async (planId) => {
    if (!email || !name) {
      alert("Please enter Name and Email to test checkout.");
      return;
    }

    setSubscribing(planId);
    const apiKey = localStorage.getItem("adi_sanlo_api_key");

    try {
      const res = await fetch("https://adi-sanlo-production.up.railway.app/v1/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          plan_id: planId,
          customer_email: email,
          customer_name: name,
          callback_url: window.location.origin + "/demo?success=true"
        })
      });

      const data = await res.json();
      if (data.checkout_url) {
        // Redirect to Nomba Checkout
        window.location.href = data.checkout_url;
      } else {
        alert("Failed to generate checkout link.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">Studyverse (Demo)</span>
        </div>
        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Test Platform powered by Adi-Sanlo
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
            Unlock your learning potential.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            This is a mock application to test your Adi-Sanlo integration. 
            The plans below are fetched live from your Developer Account using your API Key.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto mb-12">
          <h3 className="font-semibold mb-4 text-slate-800">Test Customer Details</h3>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="border px-3 py-2 rounded-md outline-none focus:border-indigo-500"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border px-3 py-2 rounded-md outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-500">Loading plans from Adi-Sanlo...</div>
        ) : plans.length === 0 ? (
          <div className="text-center text-slate-500 bg-slate-100 p-8 rounded-lg border border-slate-200">
            No plans found. Go to your <a href="/plans" className="text-indigo-600 underline">Dashboard</a> to create a plan first!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
                <div className="text-3xl font-extrabold mb-6">
                  ₦{(plan.base_amount / 100).toLocaleString()}
                  <span className="text-sm font-normal text-slate-500">/{plan.interval}</span>
                </div>
                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                  className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {subscribing === plan.id ? "Processing..." : "Subscribe Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
