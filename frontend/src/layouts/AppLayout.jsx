import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomTabBar from '../components/BottomTabBar';
import { connectSocket, disconnectSocket, subscribeToTopic } from '../ws/socket';

const AppLayout = () => {
  const { userId, storeId, role } = useSelector((state) => state.auth);

  useEffect(() => {
    // Connect to WebSocket when the layout mounts
    connectSocket((frame) => {
      console.log('STOMP connected inside AppLayout');

      // Subscribe to user-specific topics based on role
      if (role === 'CUSTOMER' && userId) {
        subscribeToTopic(`/topic/customer/${userId}`, (message) => {
          console.log('WS customer notification:', message);
          // Standard browser alert or custom banner could be triggered
          // In React, we can dispatch an event or just console log.
          // Let's create a custom event that screens can listen to!
          const event = new CustomEvent('ws-order-update', { detail: message });
          window.dispatchEvent(event);
        });
      } else if (role === 'STORE_ADMIN' && storeId) {
        subscribeToTopic(`/topic/store/${storeId}`, (message) => {
          console.log('WS store notification:', message);
          const event = new CustomEvent('ws-incoming-order', { detail: message });
          window.dispatchEvent(event);
        });
      } else if (role === 'DELIVERY_PARTNER' && userId) {
        subscribeToTopic(`/topic/delivery/${userId}`, (message) => {
          console.log('WS delivery notification:', message);
          const event = new CustomEvent('ws-delivery-update', { detail: message });
          window.dispatchEvent(event);
        });
      }
    });

    return () => {
      // Disconnect on unmount
      disconnectSocket();
    };
  }, [role, userId, storeId]);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col flex-1 transition-colors duration-200">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-24 md:pb-6 w-full">
          <Outlet />
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default AppLayout;
