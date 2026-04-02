import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EbookDetail() {
  const { id } = useParams();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    axios.get(`${API}/ebooks/${id}`).then(r => {
      setEbook(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handlePurchase = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setPurchasing(true);
    try {
      const res = await axios.post(`${API}/checkout`, {
        ebook_id: id,
        email: email,
        origin_url: window.location.origin
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      toast.error("Failed to initiate checkout. Please try again.");
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#737373] text-sm uppercase tracking-[0.2em]">Loading...</div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">Ebook Not Found</h2>
          <Link to="/series" className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA]">Back to Library</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="ebook-detail-page" className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <Link
          to={ebook.series ? `/series/${ebook.series.id}` : "/series"}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#737373] hover:text-[#FAFAFA] transition-colors mb-10"
          data-testid="back-to-series"
        >
          <ArrowLeft size={14} />
          {ebook.series ? `Back to ${ebook.series.title}` : "Back to Library"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Content */}
          <div className="lg:col-span-3">
            {ebook.series && (
              <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">
                {ebook.series.title} &mdash; Vol. {ebook.order_in_series}
              </p>
            )}
            <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl tracking-tight text-[#FAFAFA] mb-6">
              {ebook.title}
            </h1>
            <p className="text-base md:text-lg text-[#A3A3A3] leading-relaxed mb-10">
              {ebook.description}
            </p>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-2">
            <div className="border border-[#262626] bg-[#0F0F0F] p-8 sticky top-24">
              <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">Price</p>
              <p className="font-['Cormorant_Garamond'] text-4xl text-[#FAFAFA] mb-8">
                &pound;{Number(ebook.price).toFixed(2)}
              </p>

              {!showCheckout ? (
                <button
                  data-testid="purchase-button"
                  onClick={() => setShowCheckout(true)}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
                >
                  <ShoppingCart size={16} />
                  Purchase Ebook
                </button>
              ) : (
                <div data-testid="checkout-form">
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    data-testid="checkout-email-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-3 text-sm focus:outline-none focus:border-white placeholder:text-[#525252] mb-6"
                  />
                  <button
                    data-testid="confirm-purchase-button"
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-white text-black py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
                  >
                    {purchasing ? "Redirecting..." : "Continue to Payment"}
                  </button>
                  <button
                    data-testid="cancel-checkout-button"
                    onClick={() => setShowCheckout(false)}
                    className="w-full mt-3 border border-[#262626] text-[#A3A3A3] py-3 text-sm uppercase tracking-[0.15em] hover:border-[#525252] hover:text-[#FAFAFA] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <p className="text-xs text-[#525252] mt-6 leading-relaxed">
                Secure payment via Stripe. You will receive a download link
                after successful payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
