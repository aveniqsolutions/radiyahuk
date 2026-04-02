import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import EbookCard from "@/components/EbookCard";
import { ArrowLeft } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SeriesDetail() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/series/${id}`).then(r => {
      setSeries(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

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

      {/* Ebooks */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-8">
          Volumes in this series
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
