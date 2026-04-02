import React from "react";

export default function About() {
  return (
    <div data-testid="about-page" className="min-h-screen">
      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden border-b border-[#262626]">
        <img
          src="https://images.unsplash.com/photo-1763510386144-2bb37550803f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHxhcmFiaWMlMjBib29rJTIwZGFya3xlbnwwfHx8fDE3NzUxNTI1MzJ8MA&ixlib=rb-4.1.0&q=85"
          alt="About Radiyah UK"
          className="w-full h-full object-cover grayscale-[50%]"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 md:px-12 pb-12 w-full">
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-3">Who We Are</p>
            <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl tracking-tight text-[#FAFAFA]">
              About Radiyah
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-4">Our Mission</p>
            <h2 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl tracking-tight text-[#FAFAFA] mb-8">
              Making Islamic Knowledge<br />Accessible to All
            </h2>
            <div className="space-y-6 text-base text-[#A3A3A3] leading-relaxed">
              <p>
                Radiyah UK was founded with a singular purpose: to make authentic,
                practical Islamic knowledge accessible to every Muslim in the
                English-speaking world. We recognised that many people struggle to
                find resources that are both rooted in scholarly tradition and
                relevant to the challenges of contemporary life.
              </p>
              <p>
                Our ebooks are carefully researched and written, drawing from
                classical Islamic texts and the wisdom of respected scholars, while
                presenting information in a clear, approachable format. Every volume
                is designed not just to inform, but to transform — to give readers
                actionable steps they can implement immediately in their daily lives.
              </p>
              <p>
                Whether you are seeking to deepen your understanding of faith,
                improve your family life, or find balance in a fast-paced world,
                our library has been curated with your journey in mind.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#737373] mb-4">Our Values</p>
            <div className="space-y-8">
              {[
                {
                  title: "Authenticity",
                  text: "Every piece of knowledge we publish is grounded in authentic Islamic scholarship. We do not compromise on accuracy for the sake of appeal."
                },
                {
                  title: "Accessibility",
                  text: "Knowledge should not be locked behind barriers. We strive to make our ebooks affordable, well-written, and easy to understand regardless of your background."
                },
                {
                  title: "Practicality",
                  text: "We believe knowledge without action is incomplete. Each ebook provides practical guidance that readers can apply to their daily lives immediately."
                },
                {
                  title: "Excellence",
                  text: "From the depth of our research to the clarity of our writing, we hold ourselves to the highest standard in everything we produce."
                }
              ].map((v, i) => (
                <div key={i} className="border-l border-[#262626] pl-6">
                  <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#FAFAFA] mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
