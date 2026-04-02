import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_7af49c3a-28fd-4425-8ed0-253ce3a3a946/artifacts/md6e5ni9_WhatsApp%20Image%202026-02-09%20at%2017.45.14.jpeg";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/series", label: "Library" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-50 bg-[#050505] border-b border-[#262626]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-logo-link">
          <img
            src={LOGO_URL}
            alt="Radiyah UK"
            className="h-10 w-10 object-contain"
          />
          <span className="font-['Cormorant_Garamond'] text-xl tracking-wide text-[#FAFAFA]">
            RADIYAH
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={`text-xs uppercase tracking-[0.2em] transition-opacity duration-200 ${
                location.pathname === l.path
                  ? "text-[#FAFAFA] opacity-100"
                  : "text-[#A3A3A3] opacity-70 hover:opacity-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-[#FAFAFA]"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#262626] bg-[#050505]">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              data-testid={`mobile-nav-link-${l.label.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="block px-6 py-4 text-xs uppercase tracking-[0.2em] text-[#A3A3A3] hover:text-[#FAFAFA] border-b border-[#1A1A1A] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
