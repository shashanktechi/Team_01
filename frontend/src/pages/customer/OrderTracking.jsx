import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { customerApi } from '../../api/customerApi';
import OrderTimeline from '../../components/OrderTimeline';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Clock, Package, AlertTriangle } from 'lucide-react';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom teal marker icon for store
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const OrderTracking = () => {
  const { orderId } = useParams();
  const { userId } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrder = () => {
    customerApi.getOrderDetails(orderId)
      .then(setOrder)
      .catch(() => setError('Failed to load order details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();

    // Listen for WS updates and refresh order
    const handler = (e) => {
      const msg = e.detail;
      if (msg && (msg.id?.toString() === orderId || msg.orderId?.toString() === orderId)) {
        setOrder((prev) => prev ? { ...prev, status: msg.status || msg.newStatus || prev.status } : prev);
      }
    };
    window.addEventListener('ws-order-update', handler);
    return () => window.removeEventListener('ws-order-update', handler);
  }, [orderId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-sm p-4">{error}</div>;
  if (!order) return null;

  // Store and customer coordinates
  const storeLat = order.store?.location?.y ?? order.storeLat;
  const storeLng = order.store?.location?.x ?? order.storeLng;
  const custLat = order.customerLat;
  const custLng = order.customerLng;

  const hasStoreCoords = storeLat && storeLng;
  const hasCustCoords = custLat && custLng;
  const mapCenter = hasCustCoords ? [custLat, custLng] : hasStoreCoords ? [storeLat, storeLng] : null;

  // Straight-line distance estimate (Haversine approximation)
  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const distance = hasStoreCoords && hasCustCoords ? calcDistance(storeLat, storeLng, custLat, custLng) : null;
  const etaMinutes = order.estimatedDeliveryTime || (distance ? Math.round(distance * 5) : null);

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Order #{order.id}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={order.status} />
            {etaMinutes && (
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <Clock size={13} /> ~{etaMinutes} mins
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-xl font-extrabold text-teal dark:text-teal-light">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Static Map — DEFERRED: No live GPS tracking. Shows pickup & dropoff pins. */}
      {mapCenter ? (
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/50 px-4 py-2 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Live delivery tracking is not yet available. Showing store and delivery locations.
            </p>
          </div>
          <MapContainer center={mapCenter} zoom={13} className="h-52 w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hasStoreCoords && (
              <Marker position={[storeLat, storeLng]} icon={storeIcon}>
                <Popup><b>{order.store?.name || 'Store'}</b><br />{order.store?.address}</Popup>
              </Marker>
            )}
            {hasCustCoords && (
              <Marker position={[custLat, custLng]}>
                <Popup><b>Your delivery location</b><br />{order.deliveryAddress}</Popup>
              </Marker>
            )}
          </MapContainer>
          {distance && (
            <div className="bg-white dark:bg-gray-800 px-4 py-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={13} className="text-teal" />
              <span>Straight-line distance: <strong>{distance.toFixed(2)} km</strong></span>
            </div>
          )}
        </div>
      ) : null}

      {/* Order Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
          <Package size={18} className="text-teal" /> Order Progress
        </h3>
        <OrderTimeline activeStatus={order.status} />
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-2">
        <h3 className="font-bold text-gray-800 dark:text-white mb-3">Delivery Details</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
          <MapPin size={14} className="text-teal mt-0.5 flex-shrink-0" />
          {order.deliveryAddress || 'No address provided'}
        </p>
        {order.store && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Store:</span> {order.store.name}
          </p>
        )}
        {order.deliveryPartner && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Delivery Partner:</span> {order.deliveryPartner.fullName}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
