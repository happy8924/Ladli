import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './components/RecentlyViewed';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import api from './api/api';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import BackToTop from './components/BackToTop';

// Pages
import Home             from './pages/Home';
import ProductView      from './pages/ProductView';
import Login            from './pages/Login';
import ForgotPassword   from './pages/ForgotPassword';
import Register         from './pages/Register';
import Cart             from './pages/Cart';
import Wishlist         from './pages/Wishlist';
import Search           from './pages/Search';
import ProductDetails   from './pages/ProductDetails';
import AdminLayout      from './components/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import ProductForm      from './pages/admin/ProductForm';
import OrderManagement  from './pages/admin/OrderManagement';
import AdminUsers       from './pages/admin/AdminUsers';

// ── Pages (new) ──
import Catalog    from './pages/Catalog';
import CustomerDashboard from './pages/CustomerDashboard';
import TrackOrder from './pages/TrackOrder';
import FAQ        from './pages/FAQ';
import Shipping   from './pages/Shipping';
import Contact    from './pages/Contact';
import OrderSuccess from './pages/OrderSuccess';
import Checkout   from './pages/Checkout';
import Payment    from './pages/Payment';

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
                      <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/payment"  element={<ProtectedRoute><Payment /></ProtectedRoute>} />
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
                      <Route path="/admin/users"    element={<ProtectedRoute adminOnly><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
                    </Routes>
                  </main>

                  <BottomNav />
                  <BackToTop />
                  <Footer />
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