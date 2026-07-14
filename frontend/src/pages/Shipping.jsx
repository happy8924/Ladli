import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Section = ({ icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-border-color shadow-sm p-6 md:p-8"
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
        {icon}
      </div>
      <h2 className="text-xl font-black font-serif text-text-main">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Row = ({ label, value, highlight }) => (
  <div className={`flex justify-between items-center py-3 border-b border-border-color last:border-0 ${highlight ? 'text-primary font-bold' : ''}`}>
    <span className={`text-sm ${highlight ? 'font-bold' : 'text-text-muted'}`}>{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-primary' : 'text-text-main'}`}>{value}</span>
  </div>
);

const Shipping = () => {
  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black font-serif text-text-main mb-3">Shipping & Returns</h1>
          <p className="text-text-muted">Everything you need to know about getting your order delivered safely.</p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Shipping Policy */}
          <Section icon={<Truck size={20} />} title="Shipping Policy" delay={0}>
            <Row label="Free Shipping"        value="Orders above ₹2,000"    highlight />
            <Row label="Standard Delivery"    value="5–7 Business Days • ₹150" />
            <Row label="Express Delivery"     value="2–3 Business Days • ₹299" />
            <Row label="Same-Day Dispatch"    value="Orders placed before 12 PM" />
            <Row label="Delivery Coverage"    value="All India (Pan India)" />

            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Delivery timelines may extend by 1–2 days during peak festive seasons (Navratri, Diwali).
                You will be notified via SMS if your order is delayed.
              </p>
            </div>
          </Section>

          {/* Delivery Timeline */}
          <Section icon={<Clock size={20} />} title="Order Timeline" delay={0.05}>
            {[
              { step: '1', title: 'Order Placed',      desc: 'You get a confirmation email immediately.' },
              { step: '2', title: 'Processing',        desc: 'Order is prepared & quality checked. (1 day)' },
              { step: '3', title: 'Shipped',           desc: 'Tracking link sent via email & SMS.' },
              { step: '4', title: 'Out for Delivery',  desc: 'Our courier partner is on the way!' },
              { step: '5', title: 'Delivered',         desc: 'Enjoy your beautiful Ladli piece. 🎉' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 py-3 border-b border-border-color last:border-0">
                <div className="w-8 h-8 bg-primary rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">{item.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </Section>

          {/* Return Policy */}
          <Section icon={<RotateCcw size={20} />} title="Return & Exchange Policy" delay={0.1}>
            <Row label="Return Window"        value="5 Days from Delivery" highlight />
            <Row label="Exchange Window"      value="7 Days from Delivery" />
            <Row label="Refund Mode"          value="Original Payment Method" />
            <Row label="Refund Timeline"      value="5–7 Business Days" />
            <Row label="Pickup Arranged By"   value="Ladli (Free Pickup)" />

            <div className="mt-5 space-y-3">
              <h3 className="font-bold text-text-main text-sm">Conditions for Return</h3>
              {[
                'Item must be unworn, unwashed, and unaltered.',
                'Original packaging and tags must be intact.',
                'Customised / stitched orders are non-returnable.',
                'Sale / discounted items are final sale — no returns.',
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-text-muted">
                  <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </Section>

          {/* Contact CTA */}
          <div className="bg-primary rounded-2xl p-6 text-center text-white">
            <h3 className="text-xl font-black font-serif mb-2">Still have questions?</h3>
            <p className="text-white/80 text-sm mb-4">Our team is available 9 AM – 8 PM, Monday to Saturday.</p>
            <a
              href="https://wa.me/919265297660"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Shipping;
