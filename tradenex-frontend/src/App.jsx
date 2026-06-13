import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer pages
import Products      from './pages/customer/Products';
import ProductDetail from './pages/customer/ProductDetail';
import Cart          from './pages/customer/Cart';
import Checkout      from './pages/customer/Checkout';
import Orders        from './pages/customer/Orders';
import OrderDetail   from './pages/customer/OrderDetail';
import Quotes        from './pages/customer/Quotes';
import Queries       from './pages/customer/Queries';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
// import AdminUsers     from './pages/admin/AdminUsers';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminQuotes    from './pages/admin/AdminQuotes';
import AdminReviews   from './pages/admin/AdminReviews';
import AdminQueries   from './pages/admin/AdminQueries';

const Customer = ({ children }) => (
  <ProtectedRoute roles={['Customer']}>{children}</ProtectedRoute>
);
const Admin = ({ children }) => (
  <ProtectedRoute roles={['Admin']}>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'DM Sans', fontSize: '14px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/"         element={<Navigate to="/login" replace />} />

        {/* Customer */}
        <Route path="/products"     element={<Customer><Products /></Customer>} />
        <Route path="/products/:id" element={<Customer><ProductDetail /></Customer>} />
        <Route path="/cart"         element={<Customer><Cart /></Customer>} />
        <Route path="/checkout"     element={<Customer><Checkout /></Customer>} />
        <Route path="/orders"       element={<Customer><Orders /></Customer>} />
        <Route path="/orders/:id"   element={<Customer><OrderDetail /></Customer>} />
        <Route path="/quotes"       element={<Customer><Quotes /></Customer>} />
        <Route path="/queries"      element={<Customer><Queries /></Customer>} />

        {/* Admin */}
        <Route path="/admin"          element={<Admin><AdminDashboard /></Admin>} />
        {/* <Route path="/admin/users"    element={<Admin><AdminUsers /></Admin>} /> */}
        <Route path="/admin/products" element={<Admin><AdminProducts /></Admin>} />
        <Route path="/admin/orders"   element={<Admin><AdminOrders /></Admin>} />
        <Route path="/admin/quotes"   element={<Admin><AdminQuotes /></Admin>} />
        <Route path="/admin/reviews"  element={<Admin><AdminReviews /></Admin>} />
        <Route path="/admin/queries"  element={<Admin><AdminQueries /></Admin>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}