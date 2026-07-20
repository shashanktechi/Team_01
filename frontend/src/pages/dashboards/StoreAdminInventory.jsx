import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Plus, Save } from 'lucide-react';
import { TicketCard } from '../../components/ui/TicketCard';
import { Badge } from '../../components/ui/Badge';

export function StoreAdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    unitPrice: '',
    typicalShelfLifeHours: 72,
    quantity: 1,
    batchCode: '',
    expiryTime: ''
  });
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
      // Update local state to show saved, clear editing state
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
      const payload = {
        product: {
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          unitPrice: parseFloat(newProduct.unitPrice),
          typicalShelfLifeHours: parseInt(newProduct.typicalShelfLifeHours, 10)
        },
        quantity: parseInt(newProduct.quantity, 10),
        batchCode: newProduct.batchCode,
        expiryTime: newProduct.expiryTime || null
      };
      await api.post('/store/products', payload);
      setIsModalOpen(false);
      setNewProduct({
        name: '', description: '', category: '', unitPrice: '', typicalShelfLifeHours: 72, quantity: 1, batchCode: '', expiryTime: ''
      });
      fetchInventory();
    } catch (err) {
      console.error('Failed to add product', err);
      alert('Failed to add product');
    }
  };

  const getExpiryColor = (expiryTime) => {
    if (!expiryTime) return 'chalk';
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffHours = (expiry - now) / (1000 * 60 * 60);
    if (diffHours < 6) return 'clay';
    if (diffHours < 48) return 'marigold';
    return 'bazaar-green';
  };

  const formatExpiryTime = (expiryTime) => {
      if (!expiryTime) return 'N/A';
      return new Date(expiryTime).toLocaleString();
  }

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-bazaar-green" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Inventory Management</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Track and manage your stock</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <TicketCard className="bg-chalk shadow-sm border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body">
            <thead className="bg-kraft/30 border-b border-ink/10 text-ink font-bold uppercase tracking-wider text-sm font-mono">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Batch Code</th>
                <th className="p-4">Expiry Time</th>
                <th className="p-4 w-32">Quantity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {inventory.map(item => {
                  const isEditing = editingQuantity.hasOwnProperty(item.id);
                  const currentQtyValue = isEditing ? editingQuantity[item.id] : item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-ink/5 transition-colors">
                      <td className="p-4 font-bold text-ink">{item.product.name}</td>
                      <td className="p-4 text-ink-muted">{item.batchCode}</td>
                      <td className="p-4">
                        <Badge variant={getExpiryColor(item.expiryTime)}>
                            {formatExpiryTime(item.expiryTime)}
                        </Badge>
                      </td>
                      <td className="p-4">
                          <Input 
                            type="number" 
                            className="w-20 p-1 text-center" 
                            value={currentQtyValue} 
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)} 
                          />
                      </td>
                      <td className="p-4 text-right">
                          {isEditing && (
                              <Button variant="primary" size="sm" onClick={() => handleQuantitySave(item.id)}>
                                  <Save className="w-4 h-4" /> Save
                              </Button>
                          )}
                      </td>
                    </tr>
                  )
              })}
              {inventory.length === 0 && (
                  <tr>
                      <td colSpan="5" className="p-8 text-center text-ink-muted">No inventory found. Add a product to get started.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </TicketCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <TicketCard className="bg-chalk w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-xl mb-4 text-ink">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Product Name</label>
                <Input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <Input value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <Input required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Unit Price</label>
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
              
              <div className="flex gap-4 mt-6">
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="w-full">Create Product</Button>
              </div>
            </form>
          </TicketCard>
        </div>
      )}
    </div>
  );
}
