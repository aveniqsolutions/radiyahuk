import React from "react";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

export default function SeriesCard({ series, index = 0 }) {
  const hasBundlePrice = series.bundle_price && series.bundle_price > 0;

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
        <p className="text-sm text-[#A3A3A3] leading-relaxed line-clamp-3 mb-4">
          {series.description}
        </p>
        {hasBundlePrice && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#1A1A1A]">
            <Tag size={12} className="text-[#A3A3A3]" />
            <span className="text-xs uppercase tracking-[0.15em] text-[#A3A3A3]">
              Bundle: &pound;{Number(series.bundle_price).toFixed(2)}
            </span>
            {series.savings > 0 && (
              <span className="text-xs text-[#525252]">
                (Save &pound;{Number(series.savings).toFixed(2)})
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
