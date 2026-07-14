import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, LogOut, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing]   = useState(false);
  const [profile, setProfile]   = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: call api.put('/users/me', profile) to persist changes
    setEditing(false);
  };

  const cards = [
    { label: 'My Orders',  icon: <ShoppingBag size={22} />, to: '/orders',   color: 'bg-primary/10 text-primary' },
    { label: 'Wishlist',   icon: <Heart       size={22} />, to: '/wishlist',  color: 'bg-rose-100  text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-8">
      <div className="container max-w-3xl mx-auto px-4">

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-black font-serif text-text-main mb-8">My Account</h1>

        {/* Avatar + Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border-color shadow-sm p-6 flex items-center gap-5 mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-black uppercase shrink-0">
            {user?.name?.charAt(0) || <User size={28} />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold font-serif text-text-main truncate">{user?.name || 'Welcome!'}</h2>
            <p className="text-sm text-text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            className="shrink-0 p-2.5 rounded-xl border border-border-color hover:bg-bg-main transition-colors text-text-muted"
          >
            <Edit2 size={18} />
          </button>
        </motion.div>

        {/* Edit Profile Form */}
        {editing && (
          <motion.form
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-border-color shadow-sm p-6 mb-6 flex flex-col gap-4"
          >
            <h3 className="font-bold text-text-main text-lg mb-1">Edit Profile</h3>

            {[
              { label: 'Full Name',    icon: <User    size={16} />, key: 'name',    type: 'text',  placeholder: 'Your name' },
              { label: 'Email',        icon: <Mail    size={16} />, key: 'email',   type: 'email', placeholder: 'your@email.com' },
              { label: 'Phone',        icon: <Phone   size={16} />, key: 'phone',   type: 'tel',   placeholder: '+91 XXXXX XXXXX' },
              { label: 'Address',      icon: <MapPin  size={16} />, key: 'address', type: 'text',  placeholder: 'Your delivery address' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {field.icon}
                  </span>
                  <input
                    type={field.type}
                    value={profile[field.key]}
                    onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border-color bg-bg-main text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors"
              >
                <Save size={18} /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-3 rounded-xl border border-border-color text-text-muted font-bold hover:bg-bg-main transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}

        {/* Quick Link Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {cards.map(card => (
            <Link
              key={card.label}
              to={card.to}
              className="bg-white rounded-2xl border border-border-color shadow-sm p-5 flex flex-col items-start gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <span className="font-bold text-text-main">{card.label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </motion.button>

      </div>
    </div>
  );
};

export default Account;
