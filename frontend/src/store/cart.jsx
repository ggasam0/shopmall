import { createContext, useContext, useMemo, useState } from "react";
import { getStockForDistributor } from "../utils/distributor";

const CartContext = createContext(null);

export const CartProvider = ({ distributorCode, children }) => {
  const [items, setItems] = useState([]);

  const addItem = (product, quantity) => {
    const stock = getStockForDistributor(product.id, distributorCode);
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, stock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(quantity, stock) }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }
          const stock = getStockForDistributor(item.id, distributorCode);
          return { ...item, quantity: Math.min(Math.max(quantity, 0), stock) };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, total }),
    [items, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
