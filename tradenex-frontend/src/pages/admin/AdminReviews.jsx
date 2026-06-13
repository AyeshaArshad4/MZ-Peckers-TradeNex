import { useState, useEffect } from 'react';
import { getPendingReviewsApi, approveReviewApi, deleteReviewApi } from '../../api/review.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPendingReviewsApi()
      .then(({ data }) => setReviews(data.data || []))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    try { await approveReviewApi(id); toast.success('Review approved'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteReviewApi(id); toast.success('Review deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Review Moderation</h1>
        <p className="text-[#66707A] text-sm mt-1">Approve or reject pending customer reviews</p>
      </div>

      {loading ? <Spinner size="lg" className="h-64" /> : reviews.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">⭐</div>
          <p className="font-display text-xl text-[#3F454D]">No pending reviews</p>
          <p className="text-[#66707A] text-sm mt-2">All reviews have been moderated</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.ReviewID} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#3F454D]">{r.ReviewerName}</p>
                  <p className="text-xs text-[#8FAF8B] font-medium mt-0.5">{r.ProductName}</p>
                  <p className="text-xs text-[#66707A] mt-0.5">{formatDate(r.CreatedAt)}</p>
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14}
                      className={i <= r.Rating ? 'fill-amber-400 text-amber-400' : 'text-[#D8D6C8]'} />
                  ))}
                </div>
              </div>
              {r.ReviewText && (
                <p className="text-sm text-[#66707A] mb-4 bg-[#E8E4D1] rounded-xl p-3">{r.ReviewText}</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => handleApprove(r.ReviewID)}
                  className="px-4 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-semibold hover:bg-green-200 transition">
                  ✓ Approve
                </button>
                <button onClick={() => handleDelete(r.ReviewID)}
                  className="px-4 py-1.5 rounded-lg bg-[#F5E4DC] text-[#C97B5E] text-sm font-semibold hover:bg-[#EDD0C2] transition">
                  ✗ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}