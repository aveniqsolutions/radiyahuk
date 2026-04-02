import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      data-testid="footer"
      className="border-t border-[#262626] bg-[#050505] py-12 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="font-['Cormorant_Garamond'] text-xl tracking-wide text-[#FAFAFA] mb-4">
              RADIYAH UK
            </h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-xs">
              Knowledge-based ebooks rooted in Islamic tradition,
              addressing the challenges of modern life with timeless wisdom.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-4">
              Navigate
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA] transition-opacity">Home</Link>
              <Link to="/series" className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA] transition-opacity">Library</Link>
              <Link to="/about" className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA] transition-opacity">About</Link>
              <Link to="/contact" className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA] transition-opacity">Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-4">
              Get in Touch
            </p>
            <p className="text-sm text-[#A3A3A3]">hello@radiyah.co.uk</p>
            <p className="text-sm text-[#A3A3A3] mt-2">United Kingdom</p>
          </div>
        </div>
        <div className="border-t border-[#1A1A1A] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#525252]">
            &copy; {new Date().getFullYear()} Radiyah UK. All rights reserved.
          </p>
          <Link
            to="/admin/login"
            className="text-xs text-[#525252] hover:text-[#737373] transition-colors"
            data-testid="admin-login-link"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
