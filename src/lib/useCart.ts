'use client';

import { useState, useSyncExternalStore } from 'react';
import { CartItem, Product } from './types';

const STORAGE_KEY = 'hur-ma-cart';
const EMPTY: CartItem[] = [];

// localStorage'a bağlı küçük bir sepet deposu: bütün sayfalar aynı sepeti görür,
// sunucuda ve ilk hidrasyonda boş sepet döner, ilk yüklemede kayıtlı sepet silinmez.
let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getSnapshot(): CartItem[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = readStorage();
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function setCart(update: (prev: CartItem[]) => CartItem[]) {
  cache = update(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* depolama kapalıysa sepet yalnız bu sekmede yaşar */
  }
  listeners.forEach((l) => l());
}

/** Sepet durumu (tüm sayfalarda ortak) ve sepet çekmecesinin açık/kapalı durumu. */
export function useCart() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((item) => item.product.id !== productId));

  return {
    cartItems,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    addToCart: (product: Product, quantity: number) =>
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      }),
    removeFromCart,
    updateQuantity: (productId: string, quantity: number) => {
      if (quantity <= 0) return removeFromCart(productId);
      setCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    },
    clearCart: () => setCart(() => []),
  };
}
