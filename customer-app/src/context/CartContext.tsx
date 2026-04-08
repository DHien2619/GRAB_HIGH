import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  food_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string;
  addItem: (item: CartItem, restId: number, restName: string) => void;
  removeItem: (foodId: number) => void;
  updateQty: (foodId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState('');

  const addItem = (item: CartItem, restId: number, restName: string) => {
    if (restaurantId && restaurantId !== restId) {
      // Nhà hàng khác → hỏi clear cart (đơn giản: tự clear)
      setItems([{ ...item, quantity: 1 }]);
      setRestaurantId(restId);
      setRestaurantName(restName);
      return;
    }
    setRestaurantId(restId);
    setRestaurantName(restName);
    setItems(prev => {
      const existing = prev.find(i => i.food_id === item.food_id);
      if (existing) {
        return prev.map(i => i.food_id === item.food_id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (foodId: number) => {
    setItems(prev => {
      const updated = prev.filter(i => i.food_id !== foodId);
      if (updated.length === 0) { setRestaurantId(null); setRestaurantName(''); }
      return updated;
    });
  };

  const updateQty = (foodId: number, qty: number) => {
    if (qty <= 0) { removeItem(foodId); return; }
    setItems(prev => prev.map(i => i.food_id === foodId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, restaurantId, restaurantName, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
