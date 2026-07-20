import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Plus, Save, Download, Package, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function StoreAdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    unitPrice: '',
    typicalShelfLifeHours: 72,
    quantity: 1,
    batchCode: '',
    expiryTime: '',
    imageFile: null
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState({}); // { id: newQuantity }

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleQuantityChange = (id, value) => {
    setEditingQuantity(prev => ({ ...prev, [id]: value }));
  };

  const handleQuantitySave = async (id) => {
    const quantity = parseInt(editingQuantity[id], 10);
    if (isNaN(quantity)) return;
    try {
      await api.put(`/store/inventory/${id}`, { quantity });
      setInventory(inventory.map(item => item.id === id ? { ...item, quantity } : item));
      const newEditingState = { ...editingQuantity };
      delete newEditingState[id];
      setEditingQuantity(newEditingState);
    } catch (err) {
      console.error('Failed to update quantity', err);
      alert('Failed to update quantity');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      let uploadedImageUrl = null;
      if (newProduct.imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', newProduct.imageFile);
        formData.append('folder', 'upimarket/products');
        
        const uploadRes = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        uploadedImageUrl = uploadRes.data.url;
        setUploadingImage(false);
      }

      const payload = {
        product: {
          name: newProduct.name,
          sku: newProduct.sku,
          description: newProduct.description,
          category: newProduct.category,
          unitPrice: parseFloat(newProduct.unitPrice),
          typicalShelfLifeHours: parseInt(newProduct.typicalShelfLifeHours, 10),
          imageUrl: null // will be set if uploaded
        },
        quantity: parseInt(newProduct.quantity, 10),
        batchCode: newProduct.batchCode,
        expiryTime: newProduct.expiryTime || null
      };
      if (uploadedImageUrl) {
        payload.product.imageUrl = uploadedImageUrl;
      }
      
      await api.post('/store/products', payload);
      setIsModalOpen(false);
      setNewProduct({
        name: '', sku: '', description: '', category: '', unitPrice: '', typicalShelfLifeHours: 72, quantity: 1, batchCode: '', expiryTime: '', imageFile: null
      });
      fetchInventory();
    } catch (err) {
      console.error('Failed to add product', err);
      if (err.response && err.response.status === 403) {
        alert('Your store is currently pending approval. You cannot add products until an admin approves your store.');
      } else {
        alert(err.response?.data?.error || 'Failed to add product. Please try again.');
      }
    }
  };

  const getExpiryColor = (expiryTime) => {
    if (!expiryTime) return 'surface';
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffHours = (expiry - now) / (1000 * 60 * 60);
    if (diffHours < 6) return 'danger';
    if (diffHours < 48) return 'warning';
    return 'primary';
  };

  const formatExpiryTime = (expiryTime) => {
      if (!expiryTime) return 'N/A';
      return new Date(expiryTime).toLocaleString();
  }

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', variant: 'danger' };
    if (qty < 10) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'primary' };
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(i => i.quantity > 0 && i.quantity < 10).length;
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl text-ink">Inventory Management</h2>
          <p className="text-sm text-ink-muted mt-1 uppercase tracking-wider font-semibold">Track and manage your stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Total SKUs</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{totalItems}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Low Stock</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{lowStockCount}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{outOfStockCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body">
            <thead className="bg-background/30 border-b border-border text-ink-muted font-bold uppercase tracking-wider text-xs font-mono">
              <tr>
                <th className="p-4 font-semibold">Product Name</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Batch Code</th>
                <th className="p-4 font-semibold">Expiry Time</th>
                <th className="p-4 font-semibold">Stock Status</th>
                <th className="p-4 font-semibold w-32">Quantity</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventory.map(item => {
                  const isEditing = editingQuantity.hasOwnProperty(item.id);
                  const currentQtyValue = isEditing ? editingQuantity[item.id] : item.quantity;
                  const stockStatus = getStockStatus(item.quantity);
                  return (
                    <tr key={item.id} className="hover:bg-ink/5 transition-colors">
                      <td className="p-4 font-bold text-ink">{item.product.name}</td>
                      <td className="p-4 text-ink-muted text-sm font-mono">{item.product.sku || 'N/A'}</td>
                      <td className="p-4 text-ink-muted text-sm font-mono">{item.batchCode || 'N/A'}</td>
                      <td className="p-4">
                        <Badge variant={getExpiryColor(item.expiryTime)}>
                            {formatExpiryTime(item.expiryTime)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={stockStatus.variant} className="text-[10px] tracking-wider uppercase">
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                          <Input 
                            type="number" 
                            className="w-20 p-1.5 text-center text-sm" 
                            value={currentQtyValue} 
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)} 
                          />
                      </td>
                      <td className="p-4 text-right">
                          {isEditing && (
                              <Button size="sm" onClick={() => handleQuantitySave(item.id)}>
                                  <Save className="w-4 h-4 mr-1" /> Save
                              </Button>
                          )}
                      </td>
                    </tr>
                  )
              })}
              {inventory.length === 0 && (
                  <tr>
                      <td colSpan="7" className="p-12 text-center text-ink-muted">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No inventory found.</p>
                        <p className="text-sm opacity-80 mt-1">Add a product to get started.</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl mb-4 text-ink">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Product Name</label>
                  <Input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Fresh Milk" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">SKU</label>
                  <Input required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. MILK-1L-001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <Input value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Product details" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select 
                      required 
                      value={newProduct.category} 
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="" disabled>Select category</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Household">Household</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Unit Price ($)</label>
                    <Input type="number" step="0.01" required value={newProduct.unitPrice} onChange={e => setNewProduct({...newProduct, unitPrice: e.target.value})} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Initial Quantity</label>
                    <Input type="number" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Shelf Life (Hours)</label>
                    <Input type="number" required value={newProduct.typicalShelfLifeHours} onChange={e => setNewProduct({...newProduct, typicalShelfLifeHours: e.target.value})} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Batch Code</label>
                    <Input value={newProduct.batchCode} onChange={e => setNewProduct({...newProduct, batchCode: e.target.value})} placeholder="e.g. BATCH-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Expiry Time</label>
                    <Input type="datetime-local" value={newProduct.expiryTime} onChange={e => setNewProduct({...newProduct, expiryTime: e.target.value})} />
                  </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setNewProduct({...newProduct, imageFile: e.target.files[0]})} 
                    className="flex-1"
                  />
                  {newProduct.imageFile && (
                    <div className="w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden shrink-0">
                      <img 
                        src={URL.createObjectURL(newProduct.imageFile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)} disabled={uploadingImage}>Cancel</Button>
                <Button type="submit" className="w-full" disabled={uploadingImage}>
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {uploadingImage ? 'Uploading...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
