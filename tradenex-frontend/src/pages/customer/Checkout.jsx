import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrderApi } from '../../api/order.api';
import AppLayout from '../../components/layout/AppLayout';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate  = useNavigate();
  const { items, cartTotal } = useSelector((s) => s.cart);
  const [address, setAddress] = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlace = async () => {
    setLoading(true);
    try {
      const { data } = await placeOrderApi({ shippingAddress: address, notes });
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.data.OrderID}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (!items.length) { navigate('/cart'); return null; }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-display font-semibold text-[#3F454D] mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Shipping Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  rows={3} className="input-base resize-none" placeholder="Enter your full delivery address..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Order Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} className="input-base resize-none" placeholder="Any special instructions..." />
              </div>
            </div>
          </div>

          {/* Items review */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-[#3F454D] mb-4">Order Items</h2>
            <div className="divide-y divide-slate-50">
              {items.map((item) => (
                <div key={item.CartItemID} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-[#3F454D]">{item.ProductName}</p>
                    <p className="text-[#66707A] text-xs">{item.VariantName}: {item.VariantValue} × {item.Quantity}</p>
                  </div>
                  <p className="font-semibold text-[#3F454D]">{formatCurrency(item.LineTotal)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h2 className="font-display font-bold text-[#3F454D] mb-4">Payment Summary</h2>
          <div className="flex justify-between text-sm text-[#66707A] mb-2">
            <span>Subtotal ({items.length} items)</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#66707A] mb-2">
            <span>Delivery</span>
            <span className="text-green-600">Calculated by admin</span>
          </div>
          <div className="border-t border-[#CFCAB8] mt-4 pt-4 flex justify-between font-display font-bold text-[#3F454D] text-lg">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <p className="text-xs text-[#66707A] mt-2 mb-4">Payment will be collected upon delivery or as confirmed by admin.</p>
          <button onClick={handlePlace} disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}