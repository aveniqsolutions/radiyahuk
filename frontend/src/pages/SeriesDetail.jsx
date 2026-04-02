import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import EbookCard from "@/components/EbookCard";
import { ArrowLeft, Package, Tag } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SeriesDetail() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBundleCheckout, setShowBundleCheckout] = useState(false);
  const [email, setEmail] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    axios.get(`${API}/series/${id}`).then(r => {
      setSeries(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleBundlePurchase = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setPurchasing(true);
    try {
      const res = await axios.post(`${API}/checkout/bundle`, {
        series_id: id,
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

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">Series Not Found</h2>
          <Link to="/series" className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA]">Back to Library</Link>
        </div>
      </div>
    );
  }

  const hasBundlePrice = series.bundle_price && series.bundle_price > 0;
  const totalPrice = series.total_price || 0;
  const savings = series.savings || 0;

  return (
    <div data-testid="series-detail-page" className="min-h-screen">
      {/* Header */}
      <div className="border-b border-[#262626]">
        {series.image_url && (
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={series.image_url}
              alt={series.title}
              className="w-full h-full object-cover grayscale-[50%]"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <Link
            to="/series"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#737373] hover:text-[#FAFAFA] transition-colors mb-6"
            data-testid="back-to-library"
          >
            <ArrowLeft size={14} /> Back to Library
          </Link>
          <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">
            {series.ebooks?.length || 0} volumes
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl tracking-tight text-[#FAFAFA] mb-4">
            {series.title}
          </h1>
          <p className="text-base md:text-lg text-[#A3A3A3] leading-relaxed max-w-2xl">
            {series.description}
          </p>
        </div>
      </div>

      {/* Bundle Offer */}
      {hasBundlePrice && series.ebooks && series.ebooks.length > 1 && (
        <div className="border-b border-[#262626]">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
            <div className="border border-[#262626] bg-[#0F0F0F] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Package size={18} className="text-[#FAFAFA]" />
                  <p className="text-xs uppercase tracking-[0.2em] text-[#737373]">
                    Complete Series Bundle
                  </p>
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-2xl md:text-3xl text-[#FAFAFA] mb-2">
                  Get all {series.ebooks.length} volumes
                </h3>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">
                  Purchase the entire <span className="text-[#FAFAFA]">{series.title}</span> series
                  at a discounted price. All volumes delivered together.
                </p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-['Cormorant_Garamond'] text-3xl md:text-4xl text-[#FAFAFA]">
                    &pound;{Number(series.bundle_price).toFixed(2)}
                  </span>
                  <span className="text-sm text-[#525252] line-through">
                    &pound;{Number(totalPrice).toFixed(2)}
                  </span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Tag size={12} className="text-[#A3A3A3]" />
                    <span className="text-xs uppercase tracking-[0.15em] text-[#A3A3A3]">
                      Save &pound;{Number(savings).toFixed(2)}
                    </span>
                  </div>
                )}

                {!showBundleCheckout ? (
                  <button
                    data-testid="bundle-purchase-button"
                    onClick={() => setShowBundleCheckout(true)}
                    className="w-full md:w-auto bg-white text-black px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
                  >
                    Buy Complete Bundle
                  </button>
                ) : (
                  <div data-testid="bundle-checkout-form" className="space-y-3">
                    <input
                      type="email"
                      data-testid="bundle-email-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-2 text-sm focus:outline-none focus:border-white placeholder:text-[#525252]"
                    />
                    <div className="flex gap-2">
                      <button
                        data-testid="confirm-bundle-purchase"
                        onClick={handleBundlePurchase}
                        disabled={purchasing}
                        className="bg-white text-black px-6 py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
                      >
                        {purchasing ? "Redirecting..." : "Continue to Payment"}
                      </button>
                      <button
                        onClick={() => setShowBundleCheckout(false)}
                        className="border border-[#262626] text-[#A3A3A3] px-4 py-2.5 text-xs uppercase hover:text-[#FAFAFA] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ebooks */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-8">
          {hasBundlePrice ? "Or purchase individually" : "Volumes in this series"}
        </p>
        {series.ebooks && series.ebooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#262626]">
            {series.ebooks.map((ebook, i) => (
              <EbookCard key={ebook.id} ebook={ebook} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-[#A3A3A3]">No ebooks in this series yet.</p>
        )}
      </div>
    </div>
  );
}
