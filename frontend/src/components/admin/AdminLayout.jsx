import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Store,
  Crown,
  Bell,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  { path: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, description: 'Store analytics & performance' },
  { path: '/admin/products', label: 'Products',   icon: Package,         description: 'Catalog & inventory management' },
  { path: '/admin/orders',   label: 'Orders',     icon: ShoppingBag,     description: 'Fulfillment & shipment tracking' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const currentMenu = menuItems.find(i => isActive(i.path));

  return (
    <div className="flex min-h-screen bg-[#070A11] text-slate-100 font-sans selection:bg-rose-900 selection:text-white">

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          w-72 bg-[#0F172A] border-r border-slate-700/60 flex flex-col fixed h-screen left-0 top-0 z-[1000]
          transition-transform duration-300 ease-out lg:translate-x-0 lg:sticky
          ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-900 via-rose-900 to-amber-700 p-0.5 shadow-lg shadow-rose-950/50">
              <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center text-amber-400">
                <Crown size={20} />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                LADLI <span className="text-amber-500 text-xs font-sans px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">ADMIN</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Boutique Executive Portal</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-3 mb-3">
              Management Suite
            </p>
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 group relative ${
                        active
                          ? 'bg-gradient-to-r from-rose-950 to-red-900 text-white font-bold shadow-lg shadow-rose-950/40 border border-rose-800/50'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          active ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">{item.label}</span>
                        <span className={`text-[11px] truncate ${active ? 'text-rose-200/80' : 'text-slate-500'}`}>
                          {item.description}
                        </span>
                      </div>
                      {active && (
                        <div className="absolute right-3 w-1.5 h-6 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-3 mb-3">
              Store Preview
            </p>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all group"
            >
              <Store size={18} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Customer Storefront</span>
                <span className="text-[11px] text-slate-500">View live website</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* Admin User Profile Box */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0D1322]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/50 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-700 to-amber-600 text-white font-black flex items-center justify-center shrink-0 shadow-md">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-100 text-xs truncate flex items-center gap-1">
                {user?.username} <ShieldCheck size={13} className="text-amber-400 shrink-0" />
              </p>
              <p className="text-[10px] text-slate-400 capitalize truncate font-mono">
                Role: {user?.role || 'administrator'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-900/40 hover:text-red-200 transition-all text-xs font-bold"
          >
            <LogOut size={15} /> Sign Out Admin
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="h-16 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-700/60 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[100]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="hover:text-slate-200 cursor-pointer">Admin Suite</span>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="text-amber-400 font-bold">
                {currentMenu?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Status: <span className="text-emerald-400 font-bold">Online</span>
            </div>

            <button
              title="System Notifications"
              className="relative p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-colors border border-slate-700/40"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;