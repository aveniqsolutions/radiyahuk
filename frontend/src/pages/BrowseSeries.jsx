import React, { useEffect, useState } from "react";
import axios from "axios";
import SeriesCard from "@/components/SeriesCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BrowseSeries() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/series`).then(r => {
      setSeries(Array.isArray(r.data) ? r.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div data-testid="browse-series-page" className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">
            Complete Collection
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl tracking-tight text-[#FAFAFA]">
            Our Library
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#262626]">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#0F0F0F] aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : series.length === 0 ? (
          <p className="text-[#A3A3A3] text-lg">No series available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#262626]">
            {series.map((s, i) => (
              <SeriesCard key={s.id} series={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
