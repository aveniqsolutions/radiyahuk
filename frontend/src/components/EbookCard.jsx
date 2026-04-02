import React from "react";
import { Link } from "react-router-dom";

export default function EbookCard({ ebook, index = 0 }) {
  return (
    <Link
      to={`/ebooks/${ebook.id}`}
      data-testid={`ebook-card-${ebook.id}`}
      className={`group block border border-[#262626] bg-[#0F0F0F] p-6 transition-colors hover:border-[#525252] fade-in fade-in-delay-${(index % 4) + 1}`}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs uppercase tracking-[0.2em] text-[#737373]">
          Vol. {ebook.order_in_series}
        </span>
        <span className="text-sm font-medium text-[#FAFAFA]">
          &pound;{Number(ebook.price).toFixed(2)}
        </span>
      </div>
      <h4 className="font-['Cormorant_Garamond'] text-xl text-[#FAFAFA] mb-3 group-hover:text-white transition-colors">
        {ebook.title}
      </h4>
      <p className="text-sm text-[#A3A3A3] leading-relaxed line-clamp-2">
        {ebook.description}
      </p>
    </Link>
  );
}
