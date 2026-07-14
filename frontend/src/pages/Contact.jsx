import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call — replace with real api.post('/contact', form)
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  const info = [
    { icon: <MapPin  size={20} />, label: 'Address', value: '123 Fashion Street, Surat, Gujarat 395002' },
    { icon: <Phone   size={20} />, label: 'Phone',   value: '+91 92652 97660', href: 'tel:+919265297660' },
    { icon: <Mail    size={20} />, label: 'Email',   value: 'happymaniya89@gmail.com', href: 'mailto:happymaniya89@gmail.com' },
  ];

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-serif text-text-main mb-3">Contact Us</h1>
          <p className="text-text-muted max-w-lg mx-auto">
            We'd love to hear from you. Fill in the form below or reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Contact Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {info.map(item => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-border-color shadow-sm p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm font-semibold text-text-main hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-text-main">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* WhatsApp Card */}
            <motion.a
              href="https://wa.me/919265297660"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-green-500 rounded-2xl p-5 flex items-center gap-4 text-white hover:bg-green-600 transition-colors shadow-sm"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Quick Support</p>
                <p className="font-bold text-sm">Chat on WhatsApp</p>
                <p className="text-xs text-white/70 mt-0.5">Typically replies within minutes</p>
              </div>
            </motion.a>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-white rounded-2xl border border-border-color shadow-sm p-6 md:p-8"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-black font-serif text-text-main mb-2">Message Sent!</h3>
                <p className="text-text-muted text-sm max-w-xs">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h2 className="text-xl font-black font-serif text-text-main">Send a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Name *</label>
                    <input
                      name="name" required value={form.name} onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Phone</label>
                    <input
                      name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX" type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Email *</label>
                  <input
                    name="email" required type="email" value={form.email} onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Message *</label>
                  <textarea
                    name="message" required value={form.message} onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-60"
                >
                  {sending ? (
                    <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> Sending...</>
                  ) : (
                    <><Send size={18} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
