import React from "react";
import { Link } from "react-router-dom";

export default function SeriesCard({ series, index = 0 }) {
  return (
    <Link
      to={`/series/${series.id}`}
      data-testid={`series-card-${series.id}`}
      className={`group block border border-[#262626] bg-[#0F0F0F] overflow-hidden transition-colors hover:border-[#525252] fade-in fade-in-delay-${(index % 4) + 1}`}
    >
      {series.image_url && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={series.image_url}
            alt={series.title}
            className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
          {series.ebook_count || 0} {(series.ebook_count || 0) === 1 ? "volume" : "volumes"}
        </p>
        <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#FAFAFA] mb-3 group-hover:text-white transition-colors">
          {series.title}
        </h3>
        <p className="text-sm text-[#A3A3A3] leading-relaxed line-clamp-3">
          {series.description}
        </p>
      </div>
    </Link>
  );
}
