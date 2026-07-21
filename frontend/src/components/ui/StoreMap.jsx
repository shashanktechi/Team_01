import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { formatDistance } from '../../utils/geo';

// ── Custom icons ─────────────────────────────────────────────────────────────

/** Regular store marker – blue */
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Nearest store marker – green */
const nearestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** User location marker – red */
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * StoreMap
 *
 * Props:
 *  - stores:       Array<NearbyStoreDto>  – stores with lat/lng/distanceKm
 *  - userLocation: { lat, lng } | null   – user's current position
 *  - height:       string                – CSS height (default "400px")
 */
function StoreMap({ stores = [], userLocation = null, height = '400px' }) {
  // Default centre: user location, or the first store, or India
  const center = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    const first = stores.find((s) => s.lat != null && s.lng != null);
    if (first) return [first.lat, first.lng];
    return [20.5937, 78.9629]; // Geographic centre of India
  }, [userLocation, stores]);

  // The nearest store is the first element (API already orders by distance)
  const nearestId = stores[0]?.id ?? null;

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height, width: '100%', borderRadius: '12px', zIndex: 0 }}
      scrollWheelZoom={true}
    >
      {/* OpenStreetMap base tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <strong>You are here</strong>
            </Popup>
          </Marker>
          {/* 1 km accuracy circle around user */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={300}
            pathOptions={{ color: '#ef4444', fillColor: '#ef444422', fillOpacity: 0.3 }}
          />
        </>
      )}

      {/* Store markers */}
      {stores
        .filter((s) => s.lat != null && s.lng != null)
        .map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={store.id === nearestId ? nearestIcon : storeIcon}
          >
            <Popup>
              <div style={{ minWidth: '160px' }}>
                {store.logoUrl && (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
                  />
                )}
                <strong style={{ fontSize: '14px' }}>{store.name}</strong>
                {store.id === nearestId && (
                  <span style={{
                    display: 'inline-block',
                    marginLeft: '6px',
                    background: '#22c55e',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '10px',
                    padding: '1px 5px',
                  }}>Nearest</span>
                )}
                {store.address && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{store.address}</p>
                )}
                {store.distanceKm != null && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                    📍 {formatDistance(store.distanceKm)} away
                  </p>
                )}
                {store.isOpen ? (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#22c55e' }}>✓ Open now</p>
                ) : (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>✗ Closed</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

export default StoreMap;
