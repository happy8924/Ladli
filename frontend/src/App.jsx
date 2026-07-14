import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import api from './api/api';

// ── Providers (defined ONCE here, nowhere else) ──
import { AuthProvider }           from './context/AuthContext';
import { CartProvider }           from './context/CartContext';
import { WishlistProvider }       from './context/WishlistContext';
import { ToastProvider }          from './context/ToastContext';
import { RecentlyViewedProvider } from './components/RecentlyViewed';

// ── Layout ──
import Navbar         from './components/Navbar';
import BottomNav      from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import BackToTop      from './components/BackToTop';

// ── Pages (existing) ──
import Home              from './pages/Home';
import Login             from './pages/Login';
import ForgotPassword    from './pages/ForgotPassword';
import Register          from './pages/Register';
import ProductView       from './pages/ProductView';
import Cart              from './pages/Cart';
import Wishlist          from './pages/Wishlist';
import Search            from './pages/Search';
import ProductDetails    from './pages/ProductDetails';
import AdminLayout       from './components/admin/AdminLayout';
import AdminDashboard    from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import ProductForm       from './pages/admin/ProductForm';
import OrderManagement   from './pages/admin/OrderManagement';

// ── Pages (new) ──
import Catalog    from './pages/Catalog';
import CustomerDashboard from './pages/CustomerDashboard';
import TrackOrder from './pages/TrackOrder';
import FAQ        from './pages/FAQ';
import Shipping   from './pages/Shipping';
import Contact    from './pages/Contact';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  useEffect(() => {
    if (sessionStorage.getItem('ladli_visit_tracked')) return;
    sessionStorage.setItem('ladli_visit_tracked', '1');
    api.post('/track-visit').catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <ToastProvider>
              <Router>
                <div className="min-h-screen bg-cream">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      {/* Public */}
                      <Route path="/"            element={<Home />} />
                      <Route path="/login"       element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/register"    element={<Register />} />
                      <Route path="/catalog"     element={<Catalog />} />
                      <Route path="/product/:id" element={<ProductView />} />
                      <Route path="/search"      element={<Search />} />
                      <Route path="/wishlist"    element={<Wishlist />} />

                      {/* Info Pages */}
                      <Route path="/faq"      element={<FAQ />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route path="/contact"  element={<Contact />} />
                      <Route path="/track"    element={<TrackOrder />} />

                      {/* Protected */}
                      <Route path="/cart"    element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                      <Route path="/account" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                      <Route path="/orders"  element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                      <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />

                      {/* Admin */}
                      <Route path="/admin"          element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminLayout><ProductManagement /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><AdminLayout><ProductForm /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/products/:id/edit" element={<ProtectedRoute adminOnly><AdminLayout><ProductForm /></AdminLayout></ProtectedRoute>} />
                      <Route path="/admin/orders"   element={<ProtectedRoute adminOnly><AdminLayout><OrderManagement /></AdminLayout></ProtectedRoute>} />
                    </Routes>
                  </main>

                  <BottomNav />
                  <BackToTop />

                  {/* Footer */}
                  <footer className="bg-slate-950 text-slate-300 mt-auto border-t border-slate-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                        <div className="space-y-6">
                          <h2 className="text-3xl font-black text-white font-serif tracking-tight">LADLI<span className="text-secondary">.</span></h2>
                          <p className="text-slate-400 text-sm leading-relaxed">Authentic Chaniya Choli Boutique. Discover handcrafted elegance inspired by Gujarati heritage.</p>
                        </div>

                        <div>
                          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Shop</h3>
                          <ul className="space-y-4 text-sm">
                            <li><Link to="/catalog?category=bridal"   className="hover:text-primary transition-colors">Bridal Collection</Link></li>
                            <li><Link to="/catalog?category=navratri" className="hover:text-primary transition-colors">Navratri Special</Link></li>
                            <li><Link to="/catalog?category=party"    className="hover:text-primary transition-colors">Party Wear</Link></li>
                            <li><Link to="/catalog?category=new"      className="hover:text-primary transition-colors">New Arrivals</Link></li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Support</h3>
                          <ul className="space-y-4 text-sm">
                            <li><Link to="/faq"      className="hover:text-primary transition-colors">FAQ & Help</Link></li>
                            <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                            <li><Link to="/track"    className="hover:text-primary transition-colors">Track Order</Link></li>
                            <li><Link to="/contact"  className="hover:text-primary transition-colors">Contact Us</Link></li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-white font-semibold mb-6 tracking-wide uppercase text-sm">Contact</h3>
                          <ul className="space-y-4 text-sm text-slate-400">
                            <li>123 Fashion Street, Surat, Gujarat 395002</li>
                            <li>hello@ladlistore.com</li>
                            <li>+91 9265297660</li>
                          </ul>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Ladli Store. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-slate-500">
                          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                          <Link to="/terms"   className="hover:text-primary transition-colors">Terms of Service</Link>
                        </div>
                      </div>
                    </div>
                  </footer>

                </div>
              </Router>
            </ToastProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;