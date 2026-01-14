'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  cartQuantity: number;
}

export default function ProductCard({ product, onAddToCart, cartQuantity }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    onAddToCart(product, quantity);
    setTimeout(() => setIsAdding(false), 500);
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, { text: string; bg: string }> = {
      premium: { text: 'Premium', bg: 'bg-[#D4A574]' },
      klasik: { text: 'Klasik', bg: 'bg-[#6B5344]' },
      ekonomik: { text: 'Ekonomik', bg: 'bg-[#8B9A6B]' },
      ozel: { text: 'Özel', bg: 'bg-[#9B6B8B]' },
      kutu: { text: 'Kutu', bg: 'bg-[#6B8B9B]' },
    };
    return badges[category] || { text: category, bg: 'bg-gray-500' };
  };

  const badge = getCategoryBadge(product.category);

  return (
    <div className="product-card group relative">
      <Link href={`/urun/${product.id}`} className="block">
        <div className="relative h-48 sm:h-56 bg-[#FDF8F3] overflow-hidden rounded-t-2xl group-hover:shadow-lg transition-all duration-300">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pattern-bg"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            {/* Main Icon (Stylized Hurma) */}
            <div className="relative w-24 h-24 transform group-hover:scale-110 transition-transform duration-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#D4A574] w-full h-full drop-shadow-sm">
                <path d="M12 21.5c-4.5 0-8-3.5-8-9 0-5.5 5-9 8-9s8 3.5 8 9c0 5.5-3.5 9-8 9z" />
                <path d="M12 3.5v18" strokeOpacity="0.5" />
                <path d="M12 5c3 0 5 3 5 7s-2 7-5 7-5-3-5-7 2-7 5-7z" strokeOpacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Category Badge */}
          <span className={`absolute top-3 left-3 ${badge.bg} text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm`}>
            {badge.text}
          </span>

          {/* Cart Quantity Badge */}
          {cartQuantity > 0 && (
            <div className="absolute top-3 right-3 bg-[#2C1810] text-[#D4A574] text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-fade-in-up">
              {cartQuantity}
            </div>
          )}

          {/* View detail hint overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur text-[#2C1810] text-xs font-medium px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-sm">
              Ürünü İncele
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 bg-white rounded-b-2xl border-t border-gray-50">
        <Link href={`/urun/${product.id}`}>
          <h3 className="text-lg font-serif font-bold text-[#2C1810] mb-1 line-clamp-1 hover:text-[#D4A574] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-[#8C7B70] mb-4 line-clamp-2 min-h-[40px] font-light">
          {product.description || 'Premium kalite Medine hurması'}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-[#D4A574] font-serif">
            {product.price.toLocaleString('tr-TR')}
          </span>
          <span className="text-sm text-[#8C7B70]">TL / {product.unit}</span>
        </div>

        {/* Quantity & Add Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FDF8F3] rounded-lg p-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="w-8 h-8 flex items-center justify-center text-[#2C1810] hover:bg-white rounded-md transition-colors shadow-sm"
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-[#2C1810] text-sm">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(quantity + 1);
              }}
              className="w-8 h-8 flex items-center justify-center text-[#2C1810] hover:bg-white rounded-md transition-colors shadow-sm"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm shadow-sm flex items-center justify-center gap-2 ${isAdding
                ? 'bg-[#2C1810] text-white'
                : 'bg-[#D4A574] text-white hover:bg-[#C29060] hover:shadow-md'
              }`}
          >
            {isAdding ? (
              <span>Eklendi</span>
            ) : (
              <>
                <span>Sepete Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
