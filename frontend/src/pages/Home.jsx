import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SeriesCard from "@/components/SeriesCard";
import { ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/featured`).then(r => {
      setFeatured(Array.isArray(r.data) ? r.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center border-b border-[#262626]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1763510385683-6374fac8df54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxhcmFiaWMlMjBib29rJTIwZGFya3xlbnwwfHx8fDE3NzUxNTI1MzJ8MA&ixlib=rb-4.1.0&q=85)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-6 fade-in">
            Radiyah UK &mdash; Islamic Knowledge
          </p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl lg:text-7xl text-[#FAFAFA] tracking-tight leading-none max-w-3xl mb-8 fade-in fade-in-delay-1">
            Where Radiance<br />Meets Wellness
          </h1>
          <p className="text-base md:text-lg text-[#A3A3A3] leading-relaxed max-w-lg mb-10 fade-in fade-in-delay-2">
            Pure knowledge-based ebooks that address the real challenges
            of daily life through Islamic wisdom and practical guidance.
          </p>
          <Link
            to="/series"
            data-testid="hero-browse-btn"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors fade-in fade-in-delay-3"
          >
            Browse Library
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Featured Series */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-b border-[#262626]">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">
              Featured Collections
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl tracking-tight text-[#FAFAFA]">
              Our Series
            </h2>
          </div>
          <Link
            to="/series"
            data-testid="view-all-series-link"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626]">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#0F0F0F] aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626]">
            {featured.map((s, i) => (
              <SeriesCard key={s.id} series={s} index={i} />
            ))}
          </div>
        )}

        <Link
          to="/series"
          className="md:hidden mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
        >
          View All Series <ArrowRight size={14} />
        </Link>
      </section>

      {/* About Snippet */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">
              Our Mission
            </p>
            <h2 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl tracking-tight text-[#FAFAFA] mb-6">
              Knowledge That<br />Transforms Lives
            </h2>
            <p className="text-base text-[#A3A3A3] leading-relaxed mb-8">
              At Radiyah UK, we believe that authentic Islamic knowledge is the key to
              navigating the complexities of modern life. Our ebooks are carefully crafted
              to bridge classical scholarship with contemporary challenges, offering
              practical, actionable wisdom for every Muslim.
            </p>
            <Link
              to="/about"
              data-testid="about-link-home"
              className="inline-flex items-center gap-3 border border-white text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors"
            >
              Learn More
            </Link>
          </div>
          <div className="border border-[#262626] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1763510386144-2bb37550803f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHxhcmFiaWMlMjBib29rJTIwZGFya3xlbnwwfHx8fDE3NzUxNTI1MzJ8MA&ixlib=rb-4.1.0&q=85"
              alt="Islamic knowledge"
              className="w-full aspect-[4/3] object-cover grayscale-[50%]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
