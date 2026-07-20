import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentStoreId, setCurrentStoreId] = useState(null);
  const [currentStoreName, setCurrentStoreName] = useState('');

  // Returns { success: boolean, conflictStoreName?: string }
  const addToCart = (product, storeId, storeName = 'another store') => {
    // Default to the product's embedded storeId if not passed directly (useful for "Buy it again" cards)
    const targetStoreId = storeId || product.storeId;
    const targetStoreName = storeName || product.storeName || 'another store';

    if (cartItems.length > 0 && currentStoreId && targetStoreId && currentStoreId !== targetStoreId) {
       // Conflict detected
       return { success: false, conflictStoreName: currentStoreName || 'another store' };
    }

    if (cartItems.length === 0 && targetStoreId) {
      setCurrentStoreId(targetStoreId);
      setCurrentStoreName(targetStoreName);
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1, storeId: targetStoreId }];
    });

    return { success: true };
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prevItems.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      const newItems = prevItems.filter((item) => item.product.id !== productId);
      if (newItems.length === 0) {
        setCurrentStoreId(null);
        setCurrentStoreName('');
      }
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCurrentStoreId(null);
    setCurrentStoreName('');
  };

  const getProductQuantity = (productId) => {
    const item = cartItems.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.product.unitPrice || item.product.price || 0) * item.quantity,
      0
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        currentStoreId,
        currentStoreName,
        addToCart,
        removeFromCart,
        clearCart,
        getProductQuantity,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
