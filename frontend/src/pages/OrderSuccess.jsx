import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, MapPin, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-bg-main px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-400" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black font-serif text-text-main mb-2">
          Order Confirm Ho Gaya!
        </h1>
        <p className="text-text-muted mb-1">
          Aapka order <span className="text-primary font-bold">#{orderId}</span> safaltapoorvak place ho gaya hai.
        </p>
        <p className="text-text-muted text-sm mb-8">
          Order ki details aur status "My Orders" mein track kar sakte ho.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors"
          >
            <Package size={16} /> My Orders Dekho
          </Link>
          <Link
            to={`/track?order=${orderId}`}
            className="inline-flex items-center justify-center gap-2 border border-border-color text-text-main px-6 py-3 rounded-xl font-bold hover:bg-white/5 transition-colors"
          >
            <MapPin size={16} /> Order Track Karo
          </Link>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-sm mt-8"
        >
          Shopping Continue Karo <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;