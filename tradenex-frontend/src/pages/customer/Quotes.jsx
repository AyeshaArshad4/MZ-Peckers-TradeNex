import { useState, useEffect } from 'react';
import { getMyQuotesApi, createQuoteApi, acceptQuoteApi, rejectQuoteApi } from '../../api/quote.api';
import { getProductsApi } from '../../api/product.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quotes() {
  const [quotes,   setQuotes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [products, setProducts] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  // Form state
  const [items,         setItems]         = useState([{ variantId: '', quantity: 1, requestedUnitPrice: '' }]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [targetPrice,   setTargetPrice]   = useState('');

  const load = () => {
    setLoading(true);
    getMyQuotesApi()
      .then(({ data }) => setQuotes(data.data || []))
      .catch(() => toast.error('Failed to load quotes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getProductsApi({ limit: 100 })
      .then(({ data }) => setProducts(data.data?.products || []));
  }, []);

  // Flatten all variants from products for the dropdown
  const allVariants = products.flatMap(p =>
    (p.variants || []).map(v => ({
      ...v,
      productName: p.Name,
      displayLabel: `${p.Name} — ${v.VariantName}: ${v.VariantValue}`,
    }))
  );

  const addItem    = () => setItems(i => [...i, { variantId: '', quantity: 1, requestedUnitPrice: '' }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
  const updateItem = (idx, field, value) =>
    setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: value } : item));

  const handleCreate = async () => {
    const validItems = items.filter(i => i.variantId && i.quantity > 0);
    if (!validItems.length) return toast.error('Add at least one item');
    setSubmitting(true);
    try {
      await createQuoteApi({
        customerNotes,
        targetPrice: targetPrice ? +targetPrice : null,
        items: validItems.map(i => ({
          variantId:          +i.variantId,
          quantity:           +i.quantity,
          requestedUnitPrice: i.requestedUnitPrice ? +i.requestedUnitPrice : null,
        })),
      });
      toast.success('Quote request submitted!');
      setCreateModal(false);
      setItems([{ variantId: '', quantity: 1, requestedUnitPrice: '' }]);
      setCustomerNotes(''); setTargetPrice('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit quote');
    } finally { setSubmitting(false); }
  };

  const handleAccept = async (id) => {
    try {
      await acceptQuoteApi(id);
      toast.success('Quote accepted — order created!');
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleReject = async (id) => {
    try {
      await rejectQuoteApi(id);
      toast.success('Quote rejected');
      load();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#3F454D]">My Quotes</h1>
          <p className="text-[#66707A] text-sm mt-1">Request bulk pricing from our team</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Request Quote
        </button>
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : quotes.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📋</div>
          <p className="font-display text-xl text-[#3F454D] mb-2">No quotes yet</p>
          <p className="text-[#66707A] text-sm mb-6">Request a quote for bulk pricing</p>
          <button onClick={() => setCreateModal(true)} className="btn-primary">Request Quote</button>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div key={q.QuoteID} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-[#3F454D]">Quote #{q.QuoteID}</p>
                  <p className="text-xs text-[#66707A] mt-0.5">{formatDate(q.CreatedAt)} · {q.TotalItems} items</p>
                </div>
                <Badge status={q.Status} />
              </div>

              {q.CustomerNotes && (
                <p className="text-sm text-[#66707A] mb-2">
                  <span className="font-medium">Your notes:</span> {q.CustomerNotes}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {q.TargetPrice && (
                  <p className="text-[#66707A]">
                    Target: <span className="font-semibold text-[#3F454D]">{formatCurrency(q.TargetPrice)}</span>
                  </p>
                )}
                {q.AdminQuotedTotal && (
                  <p className="text-[#66707A]">
                    Quoted: <span className="font-semibold text-[#5E7A5A]">{formatCurrency(q.AdminQuotedTotal)}</span>
                  </p>
                )}
              </div>

              {/* Admin responded — show accept/reject */}
              {q.Status === 'Responded' && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => handleAccept(q.QuoteID)}
                    className="btn-primary text-sm px-4 py-2">
                    ✓ Accept & Create Order
                  </button>
                  <button onClick={() => handleReject(q.QuoteID)}
                    className="btn-danger text-sm px-4 py-2">
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Quote Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Request a Quote" size="lg">
        <div className="space-y-5">
          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#3F454D]">Products</label>
              <button onClick={addItem} className="text-[#8FAF8B] text-xs font-semibold hover:underline flex items-center gap-1">
                <Plus size={12} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select value={item.variantId}
                    onChange={e => updateItem(idx, 'variantId', e.target.value)}
                    className="input-base flex-1 text-xs">
                    <option value="">Select product variant</option>
                    {allVariants.map(v => (
                      <option key={v.VariantID} value={v.VariantID}>{v.displayLabel}</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                    className="input-base w-20 text-sm" placeholder="Qty" />
                  <input type="number" min="0" value={item.requestedUnitPrice}
                    onChange={e => updateItem(idx, 'requestedUnitPrice', e.target.value)}
                    className="input-base w-28 text-sm" placeholder="Target price" />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-[#C97B5E] hover:text-[#C97B5E] shrink-0">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#66707A] mt-1">Target price per unit is optional</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Overall Target Price (PKR)</label>
            <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
              className="input-base" placeholder="Your total budget (optional)" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Notes</label>
            <textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)}
              rows={2} className="input-base resize-none"
              placeholder="Site details, delivery requirements, urgency..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
            <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}