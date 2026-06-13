import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-2xl shadow-2xl w-full ${sizes[size]} animate-slide-up`}
        style={{ backgroundColor: '#F7F5EF', border: '1px solid #CFCAB8' }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #CFCAB8' }}>
          <h3 className="font-display text-lg font-semibold" style={{ color: '#3F454D' }}>{title}</h3>
          <button onClick={onClose} className="transition text-xl leading-none"
            style={{ color: '#66707A' }}
            onMouseEnter={e => e.currentTarget.style.color='#3F454D'}
            onMouseLeave={e => e.currentTarget.style.color='#66707A'}>×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
