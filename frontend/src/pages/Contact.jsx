import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Send } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent. We will get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
    setSending(false);
  };

  return (
    <div data-testid="contact-page" className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">Get in Touch</p>
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl tracking-tight text-[#FAFAFA]">
            Contact Us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-8">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
                Name
              </label>
              <input
                type="text"
                data-testid="contact-name-input"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Your name"
                className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-3 text-sm focus:outline-none focus:border-white placeholder:text-[#525252] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
                Email
              </label>
              <input
                type="email"
                data-testid="contact-email-input"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="you@example.com"
                className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-3 text-sm focus:outline-none focus:border-white placeholder:text-[#525252] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">
                Message
              </label>
              <textarea
                data-testid="contact-message-input"
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                placeholder="Your message"
                rows={5}
                className="w-full bg-transparent border-b border-[#525252] text-[#FAFAFA] py-3 text-sm focus:outline-none focus:border-white placeholder:text-[#525252] resize-none transition-colors"
              />
            </div>
            <button
              type="submit"
              data-testid="contact-submit-button"
              disabled={sending}
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-[#E5E5E5] transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div>
            <div className="border border-[#262626] bg-[#0F0F0F] p-8 space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">Email</p>
                <p className="text-[#FAFAFA]">hello@radiyah.co.uk</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">Location</p>
                <p className="text-[#FAFAFA]">United Kingdom</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-2">Response Time</p>
                <p className="text-sm text-[#A3A3A3]">
                  We aim to respond to all enquiries within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
