import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CustomPrintSpecs } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number, specs: CustomPrintSpecs) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  calculateItemPrice: (product: Product, specs: CustomPrintSpecs) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sri_tefa_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sri_tefa_cart', JSON.stringify(items));
  }, [items]);

  const calculateItemPrice = (product: Product, specs: CustomPrintSpecs): number => {
    let unitPrice = product.basePrice;

    // Apply material modifier
    if (specs.material && product.materials) {
      const selectedMat = product.materials.find(m => m.name === specs.material || m.id === specs.material);
      if (selectedMat) {
        unitPrice += selectedMat.priceModifier;
      }
    }

    // Apply finishings
    if (specs.finishings && product.finishings) {
      for (const finishName of specs.finishings) {
        const found = product.finishings.find(f => f.name === finishName || f.id === finishName);
        if (found) {
          unitPrice += found.pricePerUnit;
        }
      }
    }

    // Apply custom dimension area if banner / large format
    if (product.category === 'banner_display' && specs.customDimension) {
      const areaM2 = (specs.customDimension.widthCm * specs.customDimension.heightCm) / 10000;
      unitPrice = Math.max(product.basePrice, unitPrice * areaM2);
    }

    return Math.max(100, Math.round(unitPrice));
  };

  const addItem = (product: Product, quantity: number, specs: CustomPrintSpecs) => {
    const unitPrice = calculateItemPrice(product, specs);
    const subtotal = unitPrice * quantity;

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      product,
      quantity,
      unitPrice,
      specs,
      subtotal,
    };

    setItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            subtotal: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        calculateItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
