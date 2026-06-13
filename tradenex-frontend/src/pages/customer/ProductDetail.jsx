import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getProductApi } from '../../api/product.api';
import { addToCart } from '../../store/slices/cartSlice';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { ShoppingCart, Star, BadgeCheck, Award, ArrowLeft, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

function QuantityCalculator({ variants, onAddToCart }) {
  const [tw, setTw] = useState(''); const [th, setTh] = useState(''); const [area, setArea] = useState('');
  const [result, setResult] = useState(null); const [vid, setVid] = useState('');

  const calculate = () => {
    const w = parseFloat(tw), h = parseFloat(th), a = parseFloat(area);
    if (!w || !h || !a) return toast.error('Enter valid dimensions');
    const tileM2   = (w / 100) * (h / 100);
    const tiles    = Math.ceil((a / tileM2) * 1.1);
    const boxes    = Math.ceil(tiles / 200);
    setResult({ tiles, clips: tiles, boxes });
  };

  return (
    <div className="bg-[#E8F0E7] border border-[#D8E3D6] rounded-2xl p-5 mt-6">
      <h3 className="font-display font-semibold text-[#3F454D] flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-[#8FAF8B]" /> Quantity Calculator
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {[['Width (cm)', tw, setTw], ['Height (cm)', th, setTh], ['Area (m²)', area, setArea]].map(([l, v, s]) => (
          <div key={l}>
            <label className="text-xs font-semibold text-[#66707A] block mb-1">{l}</label>
            <input type="number" value={v} onChange={e => s(e.target.value)} className="input-base text-sm" placeholder="0" />
          </div>
        ))}
      </div>
      <button onClick={calculate} className="btn-primary text-sm px-4 py-2">Calculate</button>
      {result && (
        <div className="mt-4 bg-[#F7F5EF] rounded-xl p-4 space-y-1.5">
          <p className="text-sm text-[#66707A]">Tiles needed: <strong>{result.tiles}</strong></p>
          <p className="text-sm text-[#66707A]">Clips required: <strong>{result.clips}</strong></p>
          <p className="text-base font-semibold text-[#5E7A5A]">Boxes to order: <strong>{result.boxes} × 200 pcs</strong></p>
          <p className="text-xs text-[#66707A]">Includes 10% wastage allowance</p>
          {variants.length > 0 && (
            <div className="pt-2 space-y-2">
              <select value={vid} onChange={e => setVid(e.target.value)} className="input-base text-sm">
                <option value="">Select clip size variant</option>
                {variants.map(v => <option key={v.VariantID} value={v.VariantID}>{v.VariantName}: {v.VariantValue}</option>)}
              </select>
              {vid && (
                <button onClick={() => onAddToCart(+vid, result.boxes)} className="btn-primary text-sm w-full">
                  Add {result.boxes} Box{result.boxes > 1 ? 'es' : ''} to Cart
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty]             = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    getProductApi(id)
      .then(({ data }) => { setProduct(data.data); setLoading(false); })
      .catch(() => { toast.error('Product not found'); navigate('/products'); });
  }, [id]);

  const handleAddToCart = async (variantId, quantity) => {
    const vid = variantId || selectedVariant?.VariantID;
    if (!vid) return toast.error('Please select a variant');
    try {
      await dispatch(addToCart({ variantId: vid, quantity: quantity || qty })).unwrap();
      toast.success('Added to cart!');
    } catch (e) { toast.error(e || 'Failed to add'); }
  };

  if (loading) return <AppLayout><Spinner size="lg" className="h-96" /></AppLayout>;
  if (!product) return null;

  const unitPrice = product.BasePrice + (selectedVariant?.VariantPriceDelta || 0);
  const isClipProduct = product.CategoryName?.toLowerCase().includes('leveling');

  return (
    <AppLayout>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 flex items-center gap-1.5">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="card overflow-hidden h-80 mb-3">
            {product.images?.[activeImage]?.ImageUrl ? (
              <img src={img.ImageUrl?.startsWith('/uploads')
  ? `http://localhost:5000${img.ImageUrl}`
  : img.ImageUrl} alt={product.Name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#D8D6C8] flex items-center justify-center text-6xl">📦</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${i === activeImage ? 'border-brand-500' : 'border-transparent'}`}>
                  <img src={img.ImageUrl?.startsWith('/uploads')
  ? `http://localhost:5000${img.ImageUrl}`
  : img.ImageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge bg-[#D8E3D6] text-[#5E7A5A]">{product.CategoryName}</span>
            {product.HasTrademarkBadge    && <span className="badge bg-amber-100 text-amber-700 gap-1"><Award size={10} /> Trademark</span>}
            {product.HasVerifiedSupplierLabel && <span className="badge bg-[#D8E3D6] text-[#5E7A5A] gap-1"><BadgeCheck size={10} /> Verified Supplier</span>}
            <Badge status={product.IsInStock ? 'Delivered' : 'Cancelled'} label={product.IsInStock ? 'In Stock' : 'Out of Stock'} />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#3F454D] mb-2">{product.Name}</h1>
          <p className="text-xs text-[#66707A] font-mono mb-4">SKU: {product.SKU}</p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= Math.round(product.AvgRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-[#D8D6C8]'} />
              ))}
            </div>
            <span className="text-sm text-[#66707A]">{product.AvgRating || 0} ({product.reviews?.length || 0} reviews)</span>
          </div>

          <p className="font-display text-3xl font-bold text-[#3F454D] mb-1">{formatCurrency(unitPrice)}</p>
          <p className="text-xs text-[#66707A] mb-5">Stock: {product.StockQty} units</p>

          {product.description && (
            <p className="text-[#66707A] text-sm mb-5 leading-relaxed">{product.Description}</p>
          )}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#3F454D] mb-2">
                Select {product.variants[0]?.VariantName}:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button key={v.VariantID} onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition ${
                      selectedVariant?.VariantID === v.VariantID
                        ? 'border-[#8FAF8B] bg-[#E8F0E7] text-[#5E7A5A]'
                        : 'border-[#CFCAB8] text-[#66707A] hover:border-brand-300'
                    }`}>
                    {v.VariantValue}
                    {v.VariantPriceDelta > 0 && <span className="ml-1 text-xs text-[#8FAF8B]">+{formatCurrency(v.VariantPriceDelta)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-[#CFCAB8] rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-[#66707A] hover:bg-[#E8E4D1] transition">−</button>
              <span className="px-4 py-2 text-sm font-semibold text-[#3F454D] border-x border-[#CFCAB8]">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2 text-[#66707A] hover:bg-[#E8E4D1] transition">+</button>
            </div>
            <button onClick={() => handleAddToCart(null, qty)}
              disabled={!product.IsInStock}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>

          {/* Specs */}
          {product.Specifications && (
            <div className="bg-[#E8E4D1] rounded-xl p-4 text-sm text-[#66707A]">
              <p className="font-semibold text-[#3F454D] mb-1">Specifications</p>
              <p>{product.Specifications}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quantity Calculator for clip products */}
      {isClipProduct && <QuantityCalculator variants={product.variants || []} onAddToCart={handleAddToCart} />}

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-[#3F454D] mb-4">Customer Reviews</h2>
          <div className="space-y-3">
            {product.reviews.map((r) => (
              <div key={r.ReviewID} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[#3F454D] text-sm">{r.ReviewerName}</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= r.Rating ? 'fill-amber-400 text-amber-400' : 'text-[#D8D6C8]'} />)}
                  </div>
                </div>
                <p className="text-sm text-[#66707A]">{r.ReviewText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}