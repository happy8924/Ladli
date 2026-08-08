import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#3D0000] text-amber-100/90 mt-auto border-t-2 border-[#C9A227]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white font-serif tracking-tight flex items-baseline">
              LADLI<span className="text-[#C9A227] text-4xl leading-none">.</span>
            </h2>
            <p className="text-amber-100/80 text-sm leading-relaxed">
              Authentic Chaniya Choli Boutique. Discover handcrafted elegance inspired by Gujarati heritage and timeless royal craftsmanship.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-[#C9A227] font-extrabold mb-5 tracking-wider uppercase text-xs">Shop Collections</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/catalog?category=bridal"   className="hover:text-white transition-colors">Bridal Collection</Link></li>
              <li><Link to="/catalog?category=navratri" className="hover:text-white transition-colors">Navratri Special</Link></li>
              <li><Link to="/catalog?category=new"      className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/catalog"                   className="hover:text-white transition-colors">Full Catalog</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-[#C9A227] font-extrabold mb-5 tracking-wider uppercase text-xs">Support & Help</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/faq"      className="hover:text-white transition-colors">FAQ & Help Center</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/track"    className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/contact"  className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-[#C9A227] font-extrabold mb-5 tracking-wider uppercase text-xs">Boutique Address</h3>
            <ul className="space-y-3 text-sm text-amber-100/80 font-medium">
              <li>123 Fashion Street, Surat, Gujarat 395002</li>
              <li>Email: support@ladli.com</li>
              <li>Phone: +91 9265297660</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-900/60 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-amber-200/70 text-xs font-medium">&copy; {new Date().getFullYear()} Ladli Ethnic Store. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-amber-200/70 font-medium">
            <Link to="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
