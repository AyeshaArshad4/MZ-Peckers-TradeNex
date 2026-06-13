import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { logoutApi } from '../../api/auth.api';
import { ShoppingCart, LogOut, User, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const { items }  = useSelector((s) => s.cart);
  const cartCount  = items?.length || 0;

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('tn_refresh');
      if (rt) await logoutApi({ refreshToken: rt });
    } catch {}
    dispatch(logoutUser());
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur shadow-sm"
      style={{ backgroundColor: 'rgba(247,245,239,0.97)', borderBottom: '1px solid #CFCAB8' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user?.role === 'Admin' ? '/admin' : '/products'}
          className="font-display text-xl font-bold"
          style={{ color: '#3F454D' }}>
          Trade<span style={{ color: '#8FAF8B' }}>Nex</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user?.role === 'Customer' && (
            <Link to="/cart" className="relative p-2 rounded-xl transition"
              style={{ color: '#66707A' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor='#D8D6C8'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#8FAF8B' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user?.role === 'Admin' && (
            <Link to="/admin" className="btn-ghost flex items-center gap-1.5">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}

          <div className="flex items-center gap-2 pl-2" style={{ borderLeft: '1px solid #CFCAB8' }}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold leading-none" style={{ color: '#3F454D' }}>{user?.fullName}</p>
              <p className="text-xs mt-0.5" style={{ color: '#66707A' }}>{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: '#D8E3D6', color: '#5E7A5A' }}>
              {user?.fullName?.[0] || 'U'}
            </div>
            <button onClick={handleLogout}
              className="p-2 rounded-xl transition"
              style={{ color: '#66707A' }}
              onMouseEnter={e => { e.currentTarget.style.color='#C97B5E'; e.currentTarget.style.backgroundColor='#F5EAE4'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#66707A'; e.currentTarget.style.backgroundColor='transparent'; }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
