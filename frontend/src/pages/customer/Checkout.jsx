import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart, updateQuantity, removeFromCart } from '../../app/cartSlice';
import { customerApi } from '../../api/customerApi';
import { MapPin, Minus, Plus, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map click handler sub-component
const MapPicker = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) { onPositionChange(e.latlng); },
  });
  return position ? <Marker position={position} /> : null;
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cartItems = useSelector((state) => state.cart.items);

  const [address, setAddress] = useState('');
  const [mapPos, setMapPos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState([12.91, 77.63]);

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.product.unitPrice) * item.qty, 0);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMapCenter([latlng.lat, latlng.lng]);
      setMapPos(latlng);
    });
  }, []);

  const handlePlaceOrder = async () => {
    if (!mapPos) { setError('Please pin your delivery location on the map.'); return; }
    if (!address.trim()) { setError('Please enter your delivery address.'); return; }
    if (cartItems.length === 0) { setError('Your cart is empty.'); return; }
    setLoading(true); setError('');
    try {
      const orderRequest = {
        deliveryAddress: address.trim(),
        customerLat: mapPos.lat,
        customerLng: mapPos.lng,
        items: cartItems.map((item) => ({ productId: item.product.id, qty: item.qty })),
      };
      const order = await customerApi.placeOrder(orderRequest);
      dispatch(clearCart());
      navigate(`/customer/track/${order.id}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to place order. Please try again.');
    } finally { setLoading(false); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Add some items before checking out.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-teal text-white font-bold rounded-xl hover:bg-teal-dark transition-all">
          Browse Stores
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('nav.checkout')}</h1>

      {/* Cart Items */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm divide-y divide-gray-50 dark:divide-gray-700/40">
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 p-4">
            <img src={item.product.imageUrl || 'https://images.unsplash.com/photo-1610832958506-ee56336191d1?w=80'}
              alt={item.product.name} className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-700" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 dark:text-white text-sm truncate">{item.product.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">₹{parseFloat(item.product.unitPrice).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
              <button onClick={() => dispatch(updateQuantity({ productId: item.product.id, qty: item.qty - 1 }))} className="p-1 text-gray-600 dark:text-gray-300 hover:text-teal"><Minus size={12} /></button>
              <span className="text-sm font-bold text-gray-800 dark:text-white w-5 text-center">{item.qty}</span>
              <button onClick={() => dispatch(updateQuantity({ productId: item.product.id, qty: item.qty + 1 }))} className="p-1 text-gray-600 dark:text-gray-300 hover:text-teal"><Plus size={12} /></button>
            </div>
            <span className="text-sm font-bold text-teal dark:text-teal-light w-16 text-right">
              ₹{(parseFloat(item.product.unitPrice) * item.qty).toFixed(2)}
            </span>
            <button onClick={() => dispatch(removeFromCart(item.product.id))} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <div className="p-4 flex justify-between items-center bg-gray-50/60 dark:bg-gray-800/60 rounded-b-card">
          <span className="font-semibold text-gray-600 dark:text-gray-400">Total</span>
          <span className="text-xl font-extrabold text-teal dark:text-teal-light">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-teal" /> Delivery Address</h3>
        <input
          type="text" value={address} onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your full delivery address..." id="checkout-address"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
        />

        {/* Leaflet Map Picker */}
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-52">
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full" key={mapCenter.toString()}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
            <MapPicker position={mapPos} onPositionChange={setMapPos} />
          </MapContainer>
        </div>
        {mapPos ? (
          <p className="text-xs text-teal dark:text-teal-light font-semibold flex items-center gap-1">
            <MapPin size={12} /> Pinned at {mapPos.lat?.toFixed(5)}, {mapPos.lng?.toFixed(5)}
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">Tap on the map to pin your exact delivery location</p>
        )}
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>}

      <button
        onClick={handlePlaceOrder} disabled={loading}
        className="w-full py-4 rounded-xl bg-teal text-white font-extrabold text-base hover:bg-teal-dark transition-all shadow-lg shadow-teal/25 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {t('buttons.placeOrder')} · ₹{total.toFixed(2)}
      </button>
    </div>
  );
};

export default Checkout;
