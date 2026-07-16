import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import { deliveryApi } from '../../api/deliveryApi';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Phone, MapPin, Package, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Haversine distance
const calcDist = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const TaskDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    customerApi.getOrderDetails(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatus = async (status) => {
    setUpdating(status);
    try {
      await deliveryApi.updateOrderStatus(parseInt(orderId), status);
      setOrder((prev) => ({ ...prev, status }));
      setStatusMsg(`Status updated to ${status}`);
      if (status === 'DELIVERED') setTimeout(() => navigate('/delivery/dashboard'), 2000);
    } catch (e) {
      setStatusMsg(e.response?.data?.error || 'Update failed');
    } finally { setUpdating(''); }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <p className="text-gray-500 p-4">Order not found.</p>;

  const storeLat = order.store?.location?.y;
  const storeLng = order.store?.location?.x;
  const custLat = order.customerLat;
  const custLng = order.customerLng;
  const distance = storeLat && custLat ? calcDist(storeLat, storeLng, custLat, custLng) : null;
  const mapCenter = custLat ? [custLat, custLng] : storeLat ? [storeLat, storeLng] : [12.91, 77.63];
  const etaMins = distance ? Math.round(distance * 4 + 5) : order.estimatedDeliveryTime;
  const customerPhone = order.customer?.phone;

  return (
    <div className="space-y-6 w-full mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Task: Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Static Map (DEFERRED: No route polyline. Shows pickup and drop pins, straight-line distance) */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/50 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Route polyline not yet available. Showing straight-line pins. Privacy note: Customer phone number is linked directly — no call masking in place.
          </p>
        </div>
        <MapContainer center={mapCenter} zoom={13} className="h-52 w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {storeLat && <Marker position={[storeLat, storeLng]} icon={storeIcon}><Popup>📦 {order.store?.name} (Pickup)</Popup></Marker>}
          {custLat && <Marker position={[custLat, custLng]}><Popup>🏠 Drop: {order.deliveryAddress}</Popup></Marker>}
        </MapContainer>
        <div className="bg-white dark:bg-gray-800 px-5 py-3 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Navigation size={14} className="text-teal" />
            {distance ? `${distance.toFixed(2)} km (straight-line)` : 'Distance unavailable'}
          </span>
          {etaMins && <span className="text-gray-500 dark:text-gray-400 font-semibold">~{etaMins} min ETA</span>}
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1"><Package size={16} className="text-teal" /><h3 className="font-bold text-gray-800 dark:text-white">Delivery Details</h3></div>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"><MapPin size={13} className="text-teal flex-shrink-0" />{order.deliveryAddress || 'N/A'}</p>
        {order.store && <p className="text-sm text-gray-600 dark:text-gray-400"><b>Pickup:</b> {order.store.name}, {order.store.address}</p>}
        <p className="text-sm font-extrabold text-teal dark:text-teal-light">Total: ₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
      </div>

      {/* Call Customer — direct tel: link, no masking */}
      {customerPhone && (
        <div className="bg-white dark:bg-gray-800 rounded-card border border-amber-200/50 dark:border-amber-800/30 shadow-sm p-5">
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3 font-medium flex items-center gap-1.5"><AlertTriangle size={13} />Customer's raw phone number is shown below. No call masking is implemented — flag for privacy review.</p>
          <a href={`tel:${customerPhone}`}
            className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
            <Phone size={18} /> Call Customer: {customerPhone}
          </a>
        </div>
      )}

      {/* Action Buttons */}
      {statusMsg && <p className="text-sm font-semibold text-teal dark:text-teal-light bg-teal/10 rounded-xl px-4 py-3">{statusMsg}</p>}

      <div className="grid grid-cols-2 gap-3">
        {order.status !== 'PICKED_UP' && order.status !== 'DELIVERED' && (
          <button onClick={() => handleStatus('PICKED_UP')} disabled={!!updating}
            className="py-3.5 rounded-xl bg-teal text-white font-bold text-sm hover:bg-teal-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {updating === 'PICKED_UP' ? '...' : <><Package size={16} /> Mark Picked Up</>}
          </button>
        )}
        {order.status === 'PICKED_UP' && (
          <button onClick={() => handleStatus('DELIVERED')} disabled={!!updating}
            className="py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 col-span-2">
            {updating === 'DELIVERED' ? '...' : <><CheckCircle2 size={16} /> Mark Delivered</>}
          </button>
        )}
      </div>

      {/* Proof of Delivery Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">Upload Proof of Delivery</h3>
        <ImageUploader type="proof-of-delivery" options={{ orderId: parseInt(orderId) }} label="Capture or upload delivery photo" onUploadComplete={() => {}} />
      </div>
    </div>
  );
};

export default TaskDetail;
