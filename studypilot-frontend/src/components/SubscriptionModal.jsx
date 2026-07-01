import React, { useState } from 'react';

export default function SubscriptionModal({ onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubscriptionCheckout = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      // 🛰️ Hit your FastAPI backend order endpoint
      const response = await fetch('http://localhost:8000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 49900, currency: 'INR' })
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.detail || 'Failed to initiate order.');
      }

      // 💳 Configure Razorpay Modal Options Matrix
      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StudyPilot Premium",
        description: "Monthly Access Subscription Pass",
        order_id: orderData.order_id,
        handler: function (paymentResponse) {
          alert(`🎉 Subscription Active! Payment ID: ${paymentResponse.razorpay_payment_id}`);
          
          // 🚀 FORCE THE REDIRECT IMMEDIATELY!
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        },
        prefill: {
          name: "Test Student",
          email: "student@studypilot.edu",
          contact: "9999999999"
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (error) {
      console.error(error);
      alert(`Payment Processing Fault: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 flex flex-col justify-center items-center font-sans antialiased p-4">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_60px_rgba(129,140,248,0.25)] border-2 border-indigo-500/30 text-center">
        
        <div className="text-center mb-6 relative group">
          <div className="text-4xl mb-2">🔒</div>
          <h2 className="text-2xl font-black tracking-wider text-white uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent drop-shadow">
            Premium Required
          </h2>
          <p className="text-xs font-bold text-indigo-300 tracking-widest mt-1 uppercase">
            Unlock Your Spaceship Flight Core 🛸
          </p>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Unlock untethered multi-agent verification pathways, direct Firestore session persistence logging, and deep-dive explainer tracks.
        </p>

        <button 
          onClick={handleSubscriptionCheckout} 
          disabled={loading} 
          className={`w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm tracking-widest py-4 px-4 rounded-2xl transition duration-300 shadow-xl shadow-indigo-500/30 active:scale-[0.97] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "INITIALIZING SECURE TERMINAL..." : "SUBSCRIBE NOW — ₹499/mo 🎮"}
        </button>
      </div>
    </div>
  );
}