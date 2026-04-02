import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import BrowseSeries from "@/pages/BrowseSeries";
import SeriesDetail from "@/pages/SeriesDetail";
import EbookDetail from "@/pages/EbookDetail";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Download from "@/pages/Download";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <Toaster position="top-right" theme="dark" />
        <Routes>
          {/* Admin routes without public navbar/footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          {/* Public routes */}
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/series" element={<BrowseSeries />} />
                  <Route path="/series/:id" element={<SeriesDetail />} />
                  <Route path="/ebooks/:id" element={<EbookDetail />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/download/:token" element={<Download />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
