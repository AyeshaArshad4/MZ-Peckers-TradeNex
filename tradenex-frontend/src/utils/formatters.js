export const formatCurrency = (n, currency = 'PKR') =>
  `${currency} ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// Earthy / sage-toned status palette
export const getStatusColor = (status) => ({
  // Order
  Pending:   'bg-amber-100 text-amber-700',
  Confirmed: 'bg-sky-100 text-sky-700',
  Processed: 'bg-teal-100 text-teal-700',
  Shipped:   'bg-violet-100 text-violet-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-rose-100 text-rose-700',
  // Payment
  Paid:      'bg-emerald-100 text-emerald-700',
  Unpaid:    'bg-stone-100 text-stone-600',
  // Approval
  Approved:        'bg-green-100 text-green-700',
  PendingApproval: 'bg-amber-100 text-amber-700',
  Rejected:        'bg-rose-100 text-rose-700',
  // Quote
  Responded: 'bg-sky-100 text-sky-700',
  Accepted:  'bg-green-100 text-green-700',
  // Query
  Open:     'bg-amber-100 text-amber-700',
  Answered: 'bg-green-100 text-green-700',
  Closed:   'bg-stone-100 text-stone-600',
}[status] || 'bg-stone-100 text-stone-600');
