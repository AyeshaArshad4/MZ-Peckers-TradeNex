import { useState, useEffect } from 'react';
import { adminGetQueriesApi, respondQueryApi } from '../../api/query.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminQueries() {
  const [queries,  setQueries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [sending,  setSending]  = useState(false);
  const [filter,   setFilter]   = useState('');

  const load = () => {
    setLoading(true);
    adminGetQueriesApi({ status: filter || undefined })
      .then(({ data }) => setQueries(data.data || []))
      .catch(() => toast.error('Failed to load queries'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleRespond = async () => {
    if (!response.trim()) return toast.error('Enter a response');
    setSending(true);
    try {
      await respondQueryApi(selected.QueryID, { responseText: response });
      toast.success('Response sent');
      setSelected(null); setResponse('');
      load();
    } catch { toast.error('Failed to send response'); }
    finally { setSending(false); }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Customer Queries</h1>
      </div>

      <div className="flex gap-2 mb-5">
        {[['', 'All'], ['Open', 'Open'], ['Answered', 'Answered']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === val ? 'bg-[#8FAF8B] text-white' : 'bg-[#F7F5EF] text-[#66707A] border border-[#CFCAB8] hover:bg-[#E8E4D1]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : queries.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">💬</div>
          <p className="font-display text-xl text-[#3F454D]">No queries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queries.map((q) => (
            <div key={q.QueryID} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D8D6C8] flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-[#66707A]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#3F454D] text-sm">{q.CustomerName}</p>
                    <p className="text-xs text-[#66707A]">{q.CustomerEmail}</p>
                    {q.ProductName && (
                      <p className="text-xs text-[#8FAF8B] font-medium mt-0.5">{q.ProductName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={q.Status} />
                  <span className="text-xs text-[#66707A]">{formatDate(q.CreatedAt)}</span>
                </div>
              </div>

              <p className="text-sm text-[#3F454D] bg-[#E8E4D1] rounded-xl p-3 mb-3">{q.Question}</p>

              {q.ResponseText ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">Your Response</p>
                  <p className="text-sm text-[#3F454D]">{q.ResponseText}</p>
                </div>
              ) : (
                <button onClick={() => { setSelected(q); setResponse(''); }}
                  className="btn-primary text-sm px-4 py-2">
                  Respond
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Respond to Query">
        <div className="space-y-4">
          <div className="bg-[#E8E4D1] rounded-xl p-3">
            <p className="text-xs font-semibold text-[#66707A] mb-1">Question</p>
            <p className="text-sm text-[#3F454D]">{selected?.Question}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Your Response *</label>
            <textarea value={response} onChange={e => setResponse(e.target.value)}
              rows={4} className="input-base resize-none" placeholder="Write your response..." />
          </div>
          <div className="flex gap-3">
            <button onClick={handleRespond} disabled={sending} className="btn-primary flex-1">
              {sending ? 'Sending...' : 'Send Response'}
            </button>
            <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}