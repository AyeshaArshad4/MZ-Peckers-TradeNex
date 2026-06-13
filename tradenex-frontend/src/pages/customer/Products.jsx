import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getProductsApi, getCategoriesApi } from '../../api/product.api';
import { addToCart } from '../../store/slices/cartSlice';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatters';
import { Search, Filter, ShoppingCart, Star, BadgeCheck, Award } from 'lucide-react';
import toast from 'react-hot-toast';

function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!product.IsInStock) return;
    try {
      // Add first variant or base product
      toast.loading('Adding to cart...', { id: 'cart' });
      await dispatch(addToCart({ variantId: null, quantity: 1 }));
      toast.success('Added to cart!', { id: 'cart' });
    } catch {
      toast.error('Select a variant first', { id: 'cart' });
    }
  };

  return (
    <Link to={`/products/${product.ProductID}`}
      className="card hover:shadow-md transition-all duration-200 group overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-[#D8D6C8] overflow-hidden">
        {product.PrimaryImageUrl ? (
          // In ProductCard component, change the img src to:
<img
  src={product.PrimaryImageUrl?.startsWith('/uploads')
    ? `http://localhost:5000${product.PrimaryImageUrl}`
    : product.PrimaryImageUrl}
  alt={product.Name}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#CFCAB8]">
            <div className="text-5xl">📦</div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {product.HasTrademarkBadge === true && (
            <span className="badge bg-amber-100 text-amber-700 gap-1"><Award size={10} /> TM</span>
          )}
          {product.HasVerifiedSupplierLabel === true && (
            <span className="badge bg-[#D8E3D6] text-[#5E7A5A] gap-1"><BadgeCheck size={10} /> Verified</span>
          )}
          {!product.IsInStock && (
            <span className="badge bg-[#F5E4DC] text-[#C97B5E]">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#8FAF8B] font-semibold mb-1">{product.CategoryName}</p>
        <h3 className="font-display font-semibold text-[#3F454D] text-sm leading-snug mb-2 line-clamp-2">
          {product.Name}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-[#66707A]">{product.AvgRating || '0.0'}</span>
          <span className="text-xs text-[#66707A]">({product.ReviewCount || 0})</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <p className="font-display font-bold text-[#3F454D]">{formatCurrency(product.BasePrice)}</p>
          <span className="text-xs text-[#66707A] font-mono">SKU: {product.SKU}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ search: '', categoryId: '', inStock: '', page: 1, limit: 12 });
  const [meta, setMeta]             = useState({ total: 0, totalPages: 1 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProductsApi(filters),
        categories.length ? null : getCategoriesApi(),
      ]);
      const d = prodRes.data.data;
      setProducts(d.products || []);
      setMeta({ total: d.total, totalPages: d.totalPages });
      if (catRes) setCategories(catRes.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#3F454D]">Product Catalog</h1>
        <p className="text-[#66707A] mt-1 text-sm">{meta.total} products available</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66707A]" />
          <input value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search products..."
            className="input-base pl-9" />
        </div>
        <select value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}
          className="input-base w-auto min-w-[160px]">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>)}
        </select>
        <select value={filters.inStock} onChange={(e) => setFilter('inStock', e.target.value)}
          className="input-base w-auto min-w-[130px]">
          <option value="">All Stock</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? <Spinner size="lg" className="h-64" /> : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-24 text-[#66707A]">
              <div className="text-6xl mb-4">📦</div>
              <p className="font-display text-lg">No products found</p>
              <button onClick={() => setFilters({ search: '', categoryId: '', inStock: '', page: 1, limit: 12 })}
                className="btn-secondary mt-4">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.ProductID} product={p} />)}
            </div>
          )}
          <Pagination page={filters.page} totalPages={meta.totalPages}
            onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
        </>
      )}
    </AppLayout>
  );
}