import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../../api/order.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getMyOrdersApi({ page, limit: 10 })
      .then(({ data }) => { setOrders(data.data || []); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">My Orders</h1>
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📋</div>
          <p className="font-display text-xl text-[#3F454D] mb-4">No orders yet</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#E8E4D1] border-b border-[#CFCAB8]">
              <tr>
                {['Order ID','Date','Items','Status','Payment','Total',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#66707A] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((o) => (
                <tr key={o.OrderID} className="hover:bg-[#E8E4D1] transition">
                  <td className="px-4 py-3 font-mono text-xs text-[#66707A]">#{o.OrderID}</td>
                  <td className="px-4 py-3 text-[#66707A]">{formatDate(o.OrderPlacedAt)}</td>
                  <td className="px-4 py-3 text-[#66707A]">{o.TotalItems} items</td>
                  <td className="px-4 py-3"><Badge status={o.OrderStatus} /></td>
                  <td className="px-4 py-3"><Badge status={o.PaymentStatus} /></td>
                  <td className="px-4 py-3 font-display font-bold text-[#3F454D]">{formatCurrency(o.Subtotal)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.OrderID}`} className="text-[#8FAF8B] hover:text-brand-800 text-xs font-semibold">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}