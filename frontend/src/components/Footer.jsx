import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-slate-300 mt-auto border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white font-serif tracking-tight">
              LADLI<span className="text-secondary">.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Authentic Chaniya Choli Boutique. Discover handcrafted elegance inspired by Gujarati heritage.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Shop Collections</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/catalog?category=bridal"   className="hover:text-primary transition-colors">Bridal Collection</Link></li>
              <li><Link to="/catalog?category=navratri" className="hover:text-primary transition-colors">Navratri Special</Link></li>
              <li><Link to="/catalog?category=new"      className="hover:text-primary transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Support &amp; Help</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/faq"      className="hover:text-primary transition-colors">FAQ &amp; Help Center</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping &amp; Delivery</Link></li>
              <li><Link to="/track"    className="hover:text-primary transition-colors">Track Your Order</Link></li>
              <li><Link to="/contact"  className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Boutique Address</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>123 Fashion Street, Surat, Gujarat 395002</li>
              <li>support@ladli.com</li>
              <li>+91 9265297660</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Ladli Ethnic Store. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/contact" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
