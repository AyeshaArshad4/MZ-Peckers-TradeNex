import { useState, useEffect } from 'react';
import { getProductsApi, getCategoriesApi, createProductApi, updateProductApi, deleteProductApi } from '../../api/product.api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  categoryId:               '',
  sku:                      '',
  name:                     '',
  description:              '',
  specifications:           '',
  basePrice:                '',
  stockQty:                 '',
  hasTrademarkBadge:        false,
  hasVerifiedSupplierLabel: false,
};

const EMPTY_VARIANT = { variantName: '', variantValue: '', variantPriceDelta: 0, variantStockQty: '' };

export default function AdminProducts() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = create mode
  const [submitting,  setSubmitting]  = useState(false);

  // Form state
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);
  const [images,   setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);

  // ── Load ──────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    getProductsApi({ search, limit: 100 })
      .then(({ data }) => setProducts(data.data?.products || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  useEffect(() => {
    getCategoriesApi()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => {});
  }, []);

  // ── Open modal ────────────────────────────────────────────
  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setVariants([{ ...EMPTY_VARIANT }]);
    setImages([]);
    setPreviews([]);
    setModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      categoryId:               product.CategoryID   || '',
      sku:                      product.SKU           || '',
      name:                     product.Name          || '',
      description:              product.Description   || '',
      specifications:           product.Specifications || '',
      basePrice:                product.BasePrice     || '',
      stockQty:                 product.StockQty      || '',
      hasTrademarkBadge:        !!product.HasTrademarkBadge,
      hasVerifiedSupplierLabel: !!product.HasVerifiedSupplierLabel,
    });
    setVariants([{ ...EMPTY_VARIANT }]);
    setImages([]);
    setPreviews([]);
    setModal(true);
  };

  const closeModal = () => { setModal(false); setEditProduct(null); };

  // ── Form handlers ─────────────────────────────────────────
  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addVariant    = () => setVariants(v => [...v, { ...EMPTY_VARIANT }]);
  const removeVariant = (i) => setVariants(v => v.filter((_, j) => j !== i));
  const setVariant    = (i, key, val) =>
    setVariants(v => v.map((item, j) => j === i ? { ...item, [key]: val } : item));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) { toast.error('Max 6 images'); return; }
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages(imgs => imgs.filter((_, j) => j !== i));
    setPreviews(ps  => ps.filter((_, j) => j !== i));
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Validation
    if (!form.categoryId) return toast.error('Select a category');
    if (!form.sku.trim())  return toast.error('SKU is required');
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.basePrice)   return toast.error('Base price is required');

    setSubmitting(true);
    try {
      if (editProduct) {
        // Edit mode — JSON body (no file upload for now)
        await updateProductApi(editProduct.ProductID, {
          categoryId:               +form.categoryId,
          name:                     form.name,
          description:              form.description,
          specifications:           form.specifications,
          basePrice:                +form.basePrice,
          stockQty:                 +form.stockQty || 0,
          hasTrademarkBadge:        form.hasTrademarkBadge,
          hasVerifiedSupplierLabel: form.hasVerifiedSupplierLabel,
        });
        toast.success('Product updated!');
      } else {
        // Create mode — multipart form data
        const formData = new FormData();
        formData.append('categoryId',               form.categoryId);
        formData.append('sku',                      form.sku.trim());
        formData.append('name',                     form.name.trim());
        formData.append('description',              form.description);
        formData.append('specifications',           form.specifications);
        formData.append('basePrice',               form.basePrice);
        formData.append('stockQty',                form.stockQty || '0');
        formData.append('hasTrademarkBadge',       form.hasTrademarkBadge);
        formData.append('hasVerifiedSupplierLabel', form.hasVerifiedSupplierLabel);

        // Only include variants that have both name and value
        const validVariants = variants.filter(v => v.variantName.trim() && v.variantValue.trim());
        if (validVariants.length > 0) {
          formData.append('variants', JSON.stringify(validVariants));
        }

        // Append image files
        images.forEach(img => formData.append('images', img));

        await createProductApi(formData);
        toast.success('Product created!');
      }

      closeModal();
      load();
    } catch (e) {
      const msg = e.response?.data?.message
        || e.response?.data?.errors?.[0]
        || 'Failed to save product';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? It will be hidden from customers.`)) return;
    try {
      await deleteProductApi(id);
      toast.success('Product deactivated');
      load();
    } catch { toast.error('Failed'); }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#3F454D]">Products</h1>
          <p className="text-[#66707A] text-sm mt-1">{products.length} products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="input-base max-w-sm" placeholder="Search by name or SKU..." />
      </div>

      {/* Table */}
      {loading ? <Spinner size="lg" className="h-64" /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E8E4D1] border-b border-[#CFCAB8]">
                <tr>
                  {['Image','SKU','Name','Category','Price','Stock','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#66707A] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-[#66707A]">
                      No products yet.{' '}
                      <button onClick={openCreate} className="text-[#8FAF8B] font-semibold hover:underline">
                        Add your first product →
                      </button>
                    </td>
                  </tr>
                )}
                {products.map((p) => (
                  <tr key={p.ProductID} className="hover:bg-[#E8E4D1] transition">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-[#D8D6C8] overflow-hidden">
                        {p.PrimaryImageUrl
                          ? <img src={`http://localhost:5000${p.PrimaryImageUrl}`}
                              alt={p.Name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#66707A]">{p.SKU}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#3F454D] max-w-[200px] truncate">{p.Name}</p>
                    </td>
                    <td className="px-4 py-3 text-[#66707A]">{p.CategoryName}</td>
                    <td className="px-4 py-3 font-semibold text-[#3F454D]">{formatCurrency(p.BasePrice)}</td>
                    <td className="px-4 py-3 text-[#66707A]">{p.StockQty}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.IsInStock ? 'bg-green-100 text-green-700' : 'bg-[#F5E4DC] text-[#C97B5E]'}`}>
                        {p.IsInStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-[#66707A] hover:text-[#8FAF8B] hover:bg-[#E8F0E7] transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.ProductID, p.Name)}
                          className="p-1.5 rounded-lg text-[#66707A] hover:text-[#C97B5E] hover:bg-[#F5EAE4] transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={modal}
        onClose={closeModal}
        title={editProduct ? `Edit: ${editProduct.Name}` : 'Add New Product'}
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">

          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-[#3F454D] mb-3 pb-2 border-b border-[#CFCAB8]">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#66707A] mb-1">Category *</label>
                <select value={form.categoryId} onChange={e => setField('categoryId', e.target.value)}
                  className="input-base text-sm">
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#66707A] mb-1">SKU *</label>
                <input value={form.sku} onChange={e => setField('sku', e.target.value)}
                  className="input-base text-sm" placeholder="e.g. TL-CLIP-001"
                  disabled={!!editProduct} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#66707A] mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setField('name', e.target.value)}
                  className="input-base text-sm" placeholder="e.g. Tile Leveling Clips (200 pcs)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#66707A] mb-1">Base Price (PKR) *</label>
                <input type="number" min="0" step="0.01"
                  value={form.basePrice} onChange={e => setField('basePrice', e.target.value)}
                  className="input-base text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#66707A] mb-1">Stock Quantity</label>
                <input type="number" min="0"
                  value={form.stockQty} onChange={e => setField('stockQty', e.target.value)}
                  className="input-base text-sm" placeholder="0" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#66707A] mb-1">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  rows={3} className="input-base text-sm resize-none"
                  placeholder="Product description visible to customers..." />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#66707A] mb-1">Specifications</label>
                <textarea value={form.specifications} onChange={e => setField('specifications', e.target.value)}
                  rows={2} className="input-base text-sm resize-none"
                  placeholder="e.g. Material: ABS Plastic | Pack: 200pcs" />
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasTrademarkBadge}
                  onChange={e => setField('hasTrademarkBadge', e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-[#3F454D]">Trademark Badge</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasVerifiedSupplierLabel}
                  onChange={e => setField('hasVerifiedSupplierLabel', e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-[#3F454D]">Verified Supplier</span>
              </label>
            </div>
          </div>

          {/* Variants — only shown in create mode */}
          {!editProduct && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#CFCAB8]">
                <h3 className="text-sm font-semibold text-[#3F454D]">Variants (optional)</h3>
                <button onClick={addVariant}
                  className="text-[#8FAF8B] text-xs font-semibold hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add variant
                </button>
              </div>
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input value={v.variantName}
                      onChange={e => setVariant(i, 'variantName', e.target.value)}
                      placeholder="e.g. Colour, Size"
                      className="input-base text-xs col-span-3" />
                    <input value={v.variantValue}
                      onChange={e => setVariant(i, 'variantValue', e.target.value)}
                      placeholder="e.g. White, 2mm"
                      className="input-base text-xs col-span-3" />
                    <input type="number" min="0" value={v.variantPriceDelta}
                      onChange={e => setVariant(i, 'variantPriceDelta', e.target.value)}
                      placeholder="+Price"
                      className="input-base text-xs col-span-2" />
                    <input type="number" min="0" value={v.variantStockQty}
                      onChange={e => setVariant(i, 'variantStockQty', e.target.value)}
                      placeholder="Stock"
                      className="input-base text-xs col-span-3" />
                    <button onClick={() => removeVariant(i)}
                      className="col-span-1 text-[#C97B5E] hover:text-[#C97B5E] flex justify-center">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-[#66707A]">
                  Variant Name · Variant Value · Price Add-on · Stock
                </p>
              </div>
            </div>
          )}

          {/* Images — only shown in create mode */}
          {!editProduct && (
            <div>
              <h3 className="text-sm font-semibold text-[#3F454D] mb-3 pb-2 border-b border-[#CFCAB8]">
                Product Images (max 6)
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#CFCAB8] rounded-xl cursor-pointer hover:border-brand-400 hover:bg-[#E8F0E7] transition">
                <span className="text-[#66707A] text-sm">Click to upload images</span>
                <span className="text-[#CFCAB8] text-xs mt-1">JPG, PNG, WebP · max 5MB each</span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {previews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-[#C97B5E] text-white rounded-full flex items-center justify-center text-xs">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 pt-4 mt-2 border-t border-[#CFCAB8]">
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
            {submitting
              ? (editProduct ? 'Saving...' : 'Creating...')
              : (editProduct ? 'Save Changes' : 'Create Product')
            }
          </button>
          <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </AppLayout>
  );
}