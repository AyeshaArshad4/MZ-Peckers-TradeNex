import { useState, useEffect } from 'react';
import { adminGetQuotesApi, respondQuoteApi } from '../../api/quote.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminQuotes() {
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [total,   setTotal]   = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetQuotesApi()
      .then(({ data }) => setQuotes(data.data || []))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openModal = (q) => { setSelected(q); setTotal(''); setAdminNotes(''); };

  const handleRespond = async () => {
    if (!total) return toast.error('Enter quoted total');
    setUpdating(true);
    try {
      await respondQuoteApi(selected.QuoteID, { adminQuotedTotal: +total, adminNotes });
      toast.success('Response sent');
      setSelected(null);
      load();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Quote Requests</h1>
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#E8E4D1] border-b border-[#CFCAB8]">
              <tr>
                {['#','Customer','Date','Items','Target Price','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#66707A] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotes.map((q) => (
                <tr key={q.QuoteID} className="hover:bg-[#E8E4D1]">
                  <td className="px-4 py-3 font-mono text-xs text-[#66707A]">#{q.QuoteID}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#3F454D]">{q.CustomerName}</p>
                    <p className="text-xs text-[#66707A]">{q.CompanyName}</p>
                  </td>
                  <td className="px-4 py-3 text-[#66707A]">{formatDate(q.CreatedAt)}</td>
                  <td className="px-4 py-3 text-[#66707A]">{q.TotalItems}</td>
                  <td className="px-4 py-3 font-semibold text-[#3F454D]">{q.TargetPrice ? formatCurrency(q.TargetPrice) : '—'}</td>
                  <td className="px-4 py-3"><Badge status={q.Status} /></td>
                  <td className="px-4 py-3">
                    {q.Status === 'Pending' && (
                      <button onClick={() => openModal(q)} className="text-[#8FAF8B] hover:text-brand-800 text-xs font-semibold">Respond</button>
                    )}
                    {q.Status !== 'Pending' && <span className="text-[#66707A] text-xs">{q.AdminQuotedTotal ? formatCurrency(q.AdminQuotedTotal) : '—'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Respond to Quote #${selected?.QuoteID}`}>
        <div className="space-y-4">
          <div className="bg-[#E8E4D1] rounded-xl p-3 text-sm text-[#66707A]">
            <p><strong>Customer:</strong> {selected?.CustomerName}</p>
            <p><strong>Notes:</strong> {selected?.CustomerNotes || '—'}</p>
            <p><strong>Target:</strong> {selected?.TargetPrice ? formatCurrency(selected.TargetPrice) : '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Your Quoted Total (PKR)</label>
            <input type="number" value={total} onChange={e => setTotal(e.target.value)} className="input-base" placeholder="e.g. 15000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Notes to Customer</label>
            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} className="input-base resize-none" placeholder="Discount applied, delivery terms, etc." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleRespond} disabled={updating} className="btn-primary flex-1">{updating ? 'Sending...' : 'Send Response'}</button>
            <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}