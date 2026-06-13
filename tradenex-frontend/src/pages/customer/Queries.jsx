import { useState, useEffect } from 'react';
import { getMyQueriesApi, createQueryApi } from '../../api/query.api';
import { getProductsApi } from '../../api/product.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import { Plus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Queries() {
  const [queries,   setQueries]  = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [products,  setProducts] = useState([]);
  const [modal,     setModal]    = useState(false);
  const [question,  setQuestion] = useState('');
  const [productId, setProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getMyQueriesApi()
      .then(({ data }) => setQueries(data.data || []))
      .catch(() => toast.error('Failed to load queries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getProductsApi({ limit: 100 })
      .then(({ data }) => setProducts(data.data?.products || []));
  }, []);

  const handleSubmit = async () => {
    if (!question.trim()) return toast.error('Please enter your question');
    setSubmitting(true);
    try {
      await createQueryApi({
        question,
        productId: productId ? +productId : null,
      });
      toast.success('Query submitted!');
      setModal(false);
      setQuestion(''); setProductId('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#3F454D]">My Queries</h1>
          <p className="text-[#66707A] text-sm mt-1">Ask our team anything about products or orders</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ask a Question
        </button>
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : queries.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">💬</div>
          <p className="font-display text-xl text-[#3F454D] mb-2">No queries yet</p>
          <p className="text-[#66707A] text-sm mb-6">Have a question? Ask our team</p>
          <button onClick={() => setModal(true)} className="btn-primary">Ask a Question</button>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((q) => (
            <div key={q.QueryID} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#D8E3D6] flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-[#8FAF8B]" />
                  </div>
                  <div>
                    {q.ProductName && (
                      <p className="text-xs text-[#8FAF8B] font-semibold mb-1">{q.ProductName}</p>
                    )}
                    <p className="text-sm font-medium text-[#3F454D]">{q.Question}</p>
                    <p className="text-xs text-[#66707A] mt-1">{formatDate(q.CreatedAt)}</p>
                  </div>
                </div>
                <Badge status={q.Status} />
              </div>

              {q.ResponseText && (
                <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">Admin Response</p>
                  <p className="text-sm text-[#3F454D]">{q.ResponseText}</p>
                  {q.RespondedAt && (
                    <p className="text-xs text-[#66707A] mt-1">{formatDate(q.RespondedAt)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Ask a Question">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">
              Related Product (optional)
            </label>
            <select value={productId} onChange={e => setProductId(e.target.value)} className="input-base">
              <option value="">General question (not product-specific)</option>
              {products.map(p => (
                <option key={p.ProductID} value={p.ProductID}>{p.Name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#3F454D] mb-1.5">Your Question *</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              rows={4} className="input-base resize-none"
              placeholder="e.g. Are the 2mm clips suitable for large format tiles?" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Question'}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}