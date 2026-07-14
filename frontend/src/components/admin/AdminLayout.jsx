import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Settings, LogOut, Menu, X, Home
} from 'lucide-react';

const menuItems = [
  { path: '/admin',          label: 'Dashboard', icon: LayoutDashboard, description: 'Store overview and analytics' },
  { path: '/admin/products', label: 'Products',  icon: Package,         description: 'Manage product catalog' },
  { path: '/admin/orders',   label: 'Orders',     icon: ShoppingBag,     description: 'Track and manage orders' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-bg-main">

      {/* ── Sidebar ── */}
      <div className={`
        w-72 bg-bg-card border-r border-border-color flex flex-col fixed h-screen left-0 top-0 z-[1000]
        transition-transform duration-300 lg:translate-x-0 lg:relative
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <div>
            <h2 className="font-serif text-2xl font-black text-primary">Ladli Admin</h2>
            <span className="text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded-md mt-1 inline-block">v1.0</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3">Main Menu</p>
          <ul className="flex flex-col gap-1 mb-8">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-white/5 hover:text-text-main'
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{item.label}</span>
                      <span className={`text-xs ${active ? 'text-white/70' : 'text-text-muted'}`}>{item.description}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3">Quick Access</p>
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-muted hover:bg-white/5 hover:text-text-main transition-all"
          >
            <Home size={20} className="shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-sm">Store Front</span>
              <span className="text-xs text-text-muted">View customer site</span>
            </div>
          </Link>
        </nav>

        <div className="p-6 border-t border-border-color">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text-main text-sm truncate">{user?.username}</p>
              <p className="text-xs text-text-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border-color text-text-muted font-bold text-sm hover:bg-white/5 hover:text-text-main transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[70px] bg-bg-card border-b border-border-color flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[100]">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Admin Panel</span>
            <span className="text-border-color">/</span>
            <span className="text-text-main font-bold">
              {menuItems.find(i => isActive(i.path))?.label || 'Dashboard'}
            </span>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;