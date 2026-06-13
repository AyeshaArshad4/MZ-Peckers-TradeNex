import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyOrderApi, cancelOrderApi } from '../../api/order.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [reason, setReason]     = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getMyOrderApi(id)
      .then(({ data }) => setOrder(data.data))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrderApi(id, { reason });
      toast.success('Cancellation request submitted');
      setCancelModal(false);
      // Refresh
      const { data } = await getMyOrderApi(id);
      setOrder(data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to request cancellation');
    } finally { setCancelling(false); }
  };

  if (loading) return <AppLayout><Spinner size="lg" className="h-96" /></AppLayout>;
  if (!order)  return null;

  const canCancel = ['Pending', 'Confirmed'].includes(order.OrderStatus) && !order.CancellationType;

  return (
    <AppLayout>
      <button onClick={() => navigate('/orders')} className="btn-ghost mb-4 flex items-center gap-1.5">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#3F454D]">Order #{order.OrderID}</h1>
          <p className="text-[#66707A] text-sm mt-1">{formatDateTime(order.OrderPlacedAt)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge status={order.OrderStatus} />
          <Badge status={order.PaymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-display font-semibold text-[#3F454D] mb-4">Order Items</h2>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item) => (
                <div key={item.OrderItemID} className="flex gap-4 py-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#D8D6C8] flex items-center justify-center text-xl shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#3F454D] text-sm">{item.ProductName}</p>
                    <p className="text-xs text-[#66707A]">{item.VariantName}: {item.VariantValue}</p>
                    <p className="text-xs text-[#66707A] mt-0.5">
                      {item.Quantity} × {formatCurrency(item.UnitPrice)}
                    </p>
                  </div>
                  <p className="font-display font-bold text-[#3F454D] shrink-0">
                    {formatCurrency(item.LineTotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#CFCAB8] pt-4 mt-2 flex justify-between font-display font-bold text-[#3F454D]">
              <span>Total</span>
              <span>{formatCurrency(order.Subtotal)}</span>
            </div>
          </div>

          {/* Status History */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-[#3F454D] mb-4">Order Timeline</h2>
            <div className="space-y-3">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#3F454D]">{h.Status}</p>
                    {h.Notes && <p className="text-xs text-[#66707A]">{h.Notes}</p>}
                    <p className="text-xs text-[#66707A] mt-0.5">{formatDateTime(h.ChangedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display font-semibold text-[#3F454D] mb-3">Delivery Details</h2>
            <p className="text-sm text-[#66707A]">
              {order.ShippingAddress || 'No address provided'}
            </p>
            {order.Notes && (
              <p className="text-sm text-[#66707A] mt-2 italic">"{order.Notes}"</p>
            )}
          </div>

          {order.CancellationType === 'Request' && (
            <div className="card p-4 border-amber-200 bg-amber-50">
              <p className="text-sm font-semibold text-amber-800">Cancellation Requested</p>
              <p className="text-xs text-amber-700 mt-1">
                {order.CancellationDecision
                  ? `Decision: ${order.CancellationDecision}`
                  : 'Awaiting admin decision'}
              </p>
            </div>
          )}

          {canCancel && (
            <button onClick={() => setCancelModal(true)} className="btn-danger w-full">
              Request Cancellation
            </button>
          )}
        </div>
      </div>

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Request Cancellation">
        <div className="space-y-4">
          <p className="text-sm text-[#66707A]">
            Please provide a reason for cancellation. This will be reviewed by our team.
          </p>
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Reason (optional)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              rows={3} className="input-base resize-none" placeholder="Why are you cancelling this order?" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger flex-1">
              {cancelling ? 'Submitting...' : 'Submit Request'}
            </button>
            <button onClick={() => setCancelModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}