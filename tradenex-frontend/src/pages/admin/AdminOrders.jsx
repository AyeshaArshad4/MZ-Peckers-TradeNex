import { useState, useEffect } from 'react';
import { adminGetOrdersApi, updateOrderStatusApi, updatePaymentApi } from '../../api/order.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const STATUSES = ['Pending','Confirmed','Processed','Shipped','Delivered','Cancelled'];

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', payment: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetOrdersApi(filters)
      .then(({ data }) => setOrders(data.data?.orders || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filters]);

  const openModal = (order) => { setSelected(order); setNewStatus(order.OrderStatus); setNotes(''); setModalOpen(true); };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateOrderStatusApi(selected.OrderID, { status: newStatus, notes });
      toast.success('Status updated');
      setModalOpen(false);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  const handlePayment = async (id, current) => {
    const next = current === 'Paid' ? 'Unpaid' : 'Paid';
    try { await updatePaymentApi(id, { paymentStatus: next }); toast.success(`Marked as ${next}`); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Orders</h1>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3">
        <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value, page:1}))}
          className="input-base w-auto min-w-[150px]">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.payment} onChange={e => setFilters(f => ({...f, payment: e.target.value, page:1}))}
          className="input-base w-auto min-w-[130px]">
          <option value="">All Payments</option>
          <option>Paid</option><option>Unpaid</option>
        </select>
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E8E4D1] border-b border-[#CFCAB8]">
                <tr>
                  {['#','Customer','Date','Items','Status','Payment','Total','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#66707A] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => (
                  <tr key={o.OrderID} className="hover:bg-[#E8E4D1] transition">
                    <td className="px-4 py-3 font-mono text-xs text-[#66707A]">#{o.OrderID}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#3F454D]">{o.CustomerName}</p>
                      <p className="text-xs text-[#66707A]">{o.CustomerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[#66707A] whitespace-nowrap">{formatDate(o.OrderPlacedAt)}</td>
                    <td className="px-4 py-3 text-[#66707A]">{o.TotalItems}</td>
                    <td className="px-4 py-3"><Badge status={o.OrderStatus} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => handlePayment(o.OrderID, o.PaymentStatus)}>
                        <Badge status={o.PaymentStatus} />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-display font-bold text-[#3F454D] whitespace-nowrap">{formatCurrency(o.Subtotal)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openModal(o)} className="text-[#8FAF8B] hover:text-brand-800 text-xs font-semibold">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Update Order #${selected?.OrderID}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">New Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-base">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input-base resize-none" placeholder="Tracking info, etc." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleUpdate} disabled={updating} className="btn-primary flex-1">
              {updating ? 'Updating...' : 'Update Status'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}