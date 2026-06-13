export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 transition"
        style={{ color: '#66707A' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor='#D8D6C8'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className="w-9 h-9 rounded-lg text-sm font-medium transition"
          style={p === page
            ? { backgroundColor: '#8FAF8B', color: '#ffffff' }
            : { color: '#66707A' }}
          onMouseEnter={e => { if (p !== page) e.currentTarget.style.backgroundColor='#D8D6C8'; }}
          onMouseLeave={e => { if (p !== page) e.currentTarget.style.backgroundColor='transparent'; }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-40 transition"
        style={{ color: '#66707A' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor='#D8D6C8'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
        Next →
      </button>
    </div>
  );
}
