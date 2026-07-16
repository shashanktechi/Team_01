import React, { useState, useEffect } from 'react';
import { storeApi } from '../../api/storeApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ImageUploader from '../../components/ImageUploader';
import { useSelector } from 'react-redux';
import { Plus, AlertTriangle, X, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Inventory = () => {
  const { storeId } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', unitPrice: '', quantity: '', batchCode: '', typicalShelfLifeHours: '' });
  const [productImageUrl, setProductImageUrl] = useState('');
  const [newProductId, setNewProductId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    storeApi.getInventory()
      .then((d) => setInventory(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.unitPrice || !form.quantity) { setError('Name, price, and quantity are required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        product: {
          name: form.name, description: form.description, category: form.category,
          unitPrice: parseFloat(form.unitPrice),
          typicalShelfLifeHours: form.typicalShelfLifeHours ? parseInt(form.typicalShelfLifeHours) : undefined,
        },
        quantity: parseInt(form.quantity),
        batchCode: form.batchCode || undefined,
      };
      const result = await storeApi.addProduct(payload);
      setNewProductId(result?.product?.id || result?.id);
      load();
      setShowModal(false);
      setForm({ name: '', description: '', category: '', unitPrice: '', quantity: '', batchCode: '', typicalShelfLifeHours: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to add product.');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 transition-all";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Inventory</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal text-white rounded-xl text-sm font-bold hover:bg-teal-dark shadow-md shadow-teal/20 transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {inventory.length === 0 ? (
        <EmptyState title="No inventory yet" description="Add your first product to get started." icon={Package} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm bg-white dark:bg-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/50">
                <tr>
                  {['Product', 'Category', 'Price', 'Qty', 'Batch', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/40">
                {inventory.map((item) => (
                  <tr key={item.id} className={`transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-900/20 ${item.quantity < 10 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                    <td className="px-5 py-4 font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      {item.quantity < 10 && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />}
                      {item.product?.name}
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{item.product?.category || '-'}</td>
                    <td className="px-5 py-4 font-bold text-teal dark:text-teal-light">₹{parseFloat(item.product?.unitPrice || 0).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={`font-bold ${item.quantity < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-white'}`}>{item.quantity}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{item.batchCode || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={async () => { const q = prompt('New quantity:'); if (q) { await storeApi.updateInventoryQuantity(item.id, parseInt(q)); load(); } }}
                          className="px-3 py-1 text-xs font-bold text-teal border border-teal/30 rounded-lg hover:bg-teal/10 transition-all">Update Qty</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {inventory.map((item) => (
              <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-card p-4 border shadow-sm ${item.quantity < 10 ? 'border-amber-300 dark:border-amber-800/50' : 'border-gray-100 dark:border-gray-700/50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                    {item.quantity < 10 && <AlertTriangle size={14} className="text-amber-500" />}
                    {item.product?.name}
                  </p>
                  <span className="text-sm font-extrabold text-teal dark:text-teal-light">₹{parseFloat(item.product?.unitPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${item.quantity < 10 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    Qty: {item.quantity} {item.quantity < 10 ? '⚠ Low' : ''}
                  </span>
                  <button onClick={async () => { const q = prompt('New quantity:'); if (q) { await storeApi.updateInventoryQuantity(item.id, parseInt(q)); load(); } }}
                    className="px-3 py-1 text-xs font-bold text-teal border border-teal/30 rounded-lg hover:bg-teal/10">Update</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Add Product</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {[
                { name: 'name', label: 'Product Name *', placeholder: 'e.g. Fresh Apples' },
                { name: 'description', label: 'Description', placeholder: 'Brief description' },
                { name: 'category', label: 'Category', placeholder: 'e.g. Fruits' },
                { name: 'unitPrice', label: 'Unit Price (₹) *', placeholder: '0.00', type: 'number' },
                { name: 'quantity', label: 'Quantity *', placeholder: '100', type: 'number' },
                { name: 'batchCode', label: 'Batch Code', placeholder: 'BATCH001' },
                { name: 'typicalShelfLifeHours', label: 'Shelf Life (hours)', placeholder: '168', type: 'number' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} type={f.type || 'text'} id={`inv-${f.name}`} className={inputClass} />
                </div>
              ))}
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
              <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-all disabled:opacity-60">
                {saving ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
