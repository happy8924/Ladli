import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
  Home,
  Crown,
  Bell,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  { path: '/admin',          label: 'Dashboard',         icon: LayoutDashboard, description: 'Store analytics & performance' },
  { path: '/admin/products', label: 'Products',          icon: Package,         description: 'Catalog & inventory management' },
  { path: '/admin/orders',   label: 'Orders',            icon: ShoppingBag,     description: 'Fulfillment & shipment tracking' },
  { path: '/admin/users',    label: 'Customers & Users', icon: Users,           description: 'Registered customer profiles' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('admin-dark');
    return () => document.documentElement.classList.remove('admin-dark');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const currentMenu = menuItems.find(i => isActive(i.path));

  return (
    <div className="admin-dark flex min-h-screen bg-[#070A11] text-slate-100 font-sans selection:bg-rose-900 selection:text-white">

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

          {/* Home Page Link */}
          <div className="pt-4 border-t border-slate-800/80">
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-slate-400 hover:bg-slate-800/50 hover:text-amber-400 transition-colors text-xs font-semibold"
            >
              <Home size={18} />
              <span>Home Page</span>
              <ChevronRight size={14} className="ml-auto opacity-60" />
            </Link>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                {(user?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.username || 'Administrator'}</p>
                <p className="text-[10px] text-amber-400 font-semibold capitalize flex items-center gap-1">
                  <ShieldCheck size={10} /> {user?.role || 'Admin'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-serif font-black text-white text-base">LADLI ADMIN</h1>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full capitalize">
            {currentMenu?.label || 'Admin'}
          </span>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;