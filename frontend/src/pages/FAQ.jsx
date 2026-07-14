import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Orders & Shipping',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available at checkout. Orders placed before 12 PM are dispatched the same day.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! All orders above ₹2,000 qualify for free standard shipping anywhere in India.',
      },
      {
        q: 'Can I track my order?',
        a: 'Absolutely. Once your order is shipped, you\'ll receive a tracking link via email and SMS. You can also track it from the "My Orders" section in your account.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'You can cancel or modify your order within 2 hours of placing it. After that, the order enters processing and cannot be changed.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 5 days of delivery. Items must be unworn, unwashed, and in original packaging with tags intact.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Contact us via WhatsApp or email with your order ID and reason for return. Our team will arrange a pickup within 48 hours.',
      },
      {
        q: 'When will I get my refund?',
        a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item.',
      },
    ],
  },
  {
    category: 'Products',
    items: [
      {
        q: 'Are the colours accurate in photos?',
        a: 'We try our best to represent colours accurately. However, slight variations may occur due to monitor/screen settings and natural fabric dye variation.',
      },
      {
        q: 'What fabric are the Chaniya Cholis made from?',
        a: 'We use premium fabrics including pure georgette, silk, and satin with authentic zari, mirror, and thread embroidery work.',
      },
      {
        q: 'Do you offer custom stitching?',
        a: 'Yes! We offer custom sizing and stitching for an additional charge. Please contact us on WhatsApp before placing your order.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, net banking, credit/debit cards, and EMI options. Cash on Delivery is available for orders under ₹5,000.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. All payments are processed through a secure, encrypted gateway. We never store your card details.',
      },
    ],
  },
];

const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-color last:border-0">
      <button
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-text-main text-sm md:text-base">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-primary"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{   height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black font-serif text-text-main mb-3">FAQ & Help</h1>
          <p className="text-text-muted max-w-lg mx-auto">
            Can't find your answer? Chat with us on WhatsApp — we usually reply within minutes!
          </p>
          <a
            href="https://wa.me/919265297660"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* FAQ Sections */}
        <div className="flex flex-col gap-6">
          {faqs.map(section => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-border-color shadow-sm overflow-hidden"
            >
              <div className="px-6 pt-5 pb-2">
                <h2 className="text-sm font-black text-primary uppercase tracking-widest">{section.category}</h2>
              </div>
              <div className="px-6">
                {section.items.map(item => (
                  <AccordionItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FAQ;
