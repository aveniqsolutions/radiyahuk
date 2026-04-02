import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Download as DownloadIcon, ArrowLeft, Package } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Download() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/download/${token}`).then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#737373] text-sm uppercase tracking-[0.2em]">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div data-testid="download-error" className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">
            Invalid Download Link
          </h2>
          <p className="text-sm text-[#A3A3A3] mb-8">
            This download link is invalid or has expired.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-[#FAFAFA]"
          >
            <ArrowLeft size={14} /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isBundle = data.is_bundle;

  return (
    <div data-testid="download-page" className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full border border-[#262626] bg-[#0F0F0F] p-12">
        <div className="text-center mb-8">
          {isBundle ? (
            <Package size={32} className="mx-auto mb-6 text-[#FAFAFA]" />
          ) : (
            <DownloadIcon size={32} className="mx-auto mb-6 text-[#FAFAFA]" />
          )}
          <h1 className="font-['Cormorant_Garamond'] text-3xl text-[#FAFAFA] mb-4">
            {data.title}
          </h1>
          <p className="text-sm text-[#A3A3A3]">{data.message}</p>
        </div>

        {isBundle && data.ebooks ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-4">
              {data.ebooks.length} volumes included
            </p>
            {data.ebooks.map((eb, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-[#1A1A1A] pb-3"
              >
                <span className="text-sm text-[#FAFAFA]">{eb.title}</span>
                {eb.download_url && eb.download_url !== "#" ? (
                  <a
                    href={eb.download_url}
                    className="text-xs uppercase tracking-[0.15em] text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-[#525252]">Coming soon</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            {data.download_url && data.download_url !== "#" ? (
              <a
                href={data.download_url}
                data-testid="download-file-button"
                className="inline-flex items-center gap-3 bg-white text-black px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon size={16} />
                Download Now
              </a>
            ) : (
              <p className="text-sm text-[#525252]">
                Download file will be available soon. Please check back later.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
