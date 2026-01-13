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
    <div className="product-card group">
      {/* Image - Clickable for product detail */}
      <Link href={`/urun/${product.id}`} className="block">
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-[#E8C9A8] to-[#D4A574] overflow-hidden cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 32 32"
              fill="none"
              className="opacity-30 group-hover:scale-110 transition-transform duration-500"
            >
              <ellipse cx="16" cy="18" rx="7" ry="10" fill="#4A3728" />
              <ellipse cx="16" cy="18" rx="5" ry="8" fill="#6B5344" />
              <path d="M16 6 Q20 2 24 4 Q20 6 16 8 Z" fill="#4A3728" opacity="0.5" />
              <path d="M16 6 Q12 2 8 4 Q12 6 16 8 Z" fill="#4A3728" opacity="0.5" />
            </svg>
          </div>

          {/* Category Badge */}
          <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 ${badge.bg} text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full`}>
            {badge.text}
          </span>

          {/* Cart Quantity Badge */}
          {cartQuantity > 0 && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#2C1810] text-white text-[10px] sm:text-xs font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center">
              {cartQuantity}
            </span>
          )}

          {/* View detail hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-full">
              Detay
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 sm:p-5">
        <Link href={`/urun/${product.id}`}>
          <h3 className="text-base sm:text-lg font-semibold text-[#2C1810] mb-1 sm:mb-2 line-clamp-1 hover:text-[#D4A574] transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-[#6B5344] mb-3 sm:mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {product.description || 'Premium kalite Medine hurması'}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 sm:gap-2 mb-3 sm:mb-4">
          <span className="text-xl sm:text-2xl font-bold text-[#D4A574]">
            {product.price.toLocaleString('tr-TR')}
          </span>
          <span className="text-xs sm:text-sm text-[#6B5344]">TL / {product.unit}</span>
        </div>

        {/* Quantity & Add Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center border-2 border-[#E8C9A8] rounded-lg overflow-hidden">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(Math.max(1, quantity - 1));
              }}
              className="px-2 sm:px-3 py-2 hover:bg-[#F5EDE4] transition-colors touch-manipulation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2" className="sm:w-4 sm:h-4">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span className="px-2 sm:px-4 py-2 font-medium text-[#2C1810] min-w-[36px] sm:min-w-[50px] text-center text-sm sm:text-base">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuantity(quantity + 1);
              }}
              className="px-2 sm:px-3 py-2 hover:bg-[#F5EDE4] transition-colors touch-manipulation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2" className="sm:w-4 sm:h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base touch-manipulation ${isAdding
                ? 'bg-green-500 text-white scale-95'
                : 'bg-[#D4A574] text-[#2C1810] hover:bg-[#B8956A]'
              }`}
          >
            {isAdding ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              'Ekle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
