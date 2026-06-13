import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeFromCart } from '../../store/slices/cartSlice';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items, cartTotal, loading } = useSelector((s) => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleRemove = async (id) => {
    try { await dispatch(removeFromCart(id)).unwrap(); toast.success('Removed'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <AppLayout><Spinner size="lg" className="h-64" /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Your Cart</h1>
        <p className="text-[#66707A] text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🛒</div>
          <p className="font-display text-xl text-[#3F454D] mb-2">Your cart is empty</p>
          <p className="text-[#66707A] text-sm mb-6">Add some products to get started</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.CartItemID} className="card p-4 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-[#D8D6C8] overflow-hidden shrink-0">
                  {item.PrimaryImageUrl
                    ? <img src={item.PrimaryImageUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3F454D] text-sm truncate">{item.ProductName}</p>
                  <p className="text-xs text-[#66707A] mt-0.5">{item.VariantName}: {item.VariantValue}</p>
                  <p className="text-xs text-[#66707A] mt-1">Qty: {item.Quantity} × {formatCurrency(item.UnitPrice)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-[#3F454D]">{formatCurrency(item.LineTotal)}</p>
                  <button onClick={() => handleRemove(item.CartItemID)}
                    className="text-[#C97B5E] hover:text-[#C97B5E] mt-2 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit">
            <h2 className="font-display font-bold text-[#3F454D] mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.CartItemID} className="flex justify-between text-[#66707A]">
                  <span className="truncate mr-2">{i.ProductName} ×{i.Quantity}</span>
                  <span className="shrink-0">{formatCurrency(i.LineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#CFCAB8] mt-4 pt-4 flex justify-between font-display font-bold text-[#3F454D]">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Proceed to Checkout
            </button>
            <Link to="/products" className="btn-secondary w-full mt-2 text-center block">Continue Shopping</Link>
          </div>
        </div>
      )}
    </AppLayout>
  );
}