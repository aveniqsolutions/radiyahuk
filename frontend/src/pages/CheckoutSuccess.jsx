import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Download, Loader2, XCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("checking");
  const [downloadToken, setDownloadToken] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const pollStatus = useCallback(async () => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    try {
      const res = await axios.get(`${API}/checkout/status/${sessionId}`);
      if (res.data.payment_status === "paid") {
        setStatus("paid");
        setDownloadToken(res.data.download_token);
      } else if (res.data.status === "expired") {
        setStatus("expired");
      } else {
        setStatus("pending");
        if (attempts < 10) {
          setTimeout(() => setAttempts(a => a + 1), 2000);
        } else {
          setStatus("timeout");
        }
      }
    } catch {
      setStatus("error");
    }
  }, [sessionId, attempts]);

  useEffect(() => {
    pollStatus();
  }, [pollStatus]);

  return (
    <div data-testid="checkout-success-page" className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {status === "checking" || status === "pending" ? (
          <div className="fade-in">
            <Loader2 size={40} className="mx-auto mb-6 text-[#737373] animate-spin" />
            <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">
              Processing Payment
            </h1>
            <p className="text-sm text-[#A3A3A3]">
              Please wait while we confirm your payment...
            </p>
          </div>
        ) : status === "paid" ? (
          <div className="fade-in">
            <CheckCircle size={40} className="mx-auto mb-6 text-[#FAFAFA]" />
            <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">
              Payment Successful
            </h1>
            <p className="text-sm text-[#A3A3A3] mb-8">
              Thank you for your purchase. Your ebook is ready for download.
            </p>
            {downloadToken && (
              <Link
                to={`/download/${downloadToken}`}
                data-testid="download-link"
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
              >
                <Download size={16} />
                Download Your Ebook
              </Link>
            )}
          </div>
        ) : (
          <div className="fade-in">
            <XCircle size={40} className="mx-auto mb-6 text-[#737373]" />
            <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">
              {status === "expired" ? "Session Expired" : status === "timeout" ? "Status Check Timeout" : "Something Went Wrong"}
            </h1>
            <p className="text-sm text-[#A3A3A3] mb-8">
              {status === "timeout"
                ? "We couldn't confirm your payment. Please check your email for confirmation."
                : "Please try again or contact us for assistance."}
            </p>
            <Link
              to="/series"
              className="inline-flex items-center gap-3 border border-white text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors"
            >
              Return to Library
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
