'use client';

import { CartItem } from '@/lib/types';
import { useEffect } from 'react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onClear,
}: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return '';

    let message = 'Merhaba, aşağıdaki ürünleri sipariş etmek istiyorum:\n\n';

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Miktar: ${item.quantity} ${item.product.unit}\n`;
      message += `   Fiyat: ${(item.product.price * item.quantity).toLocaleString('tr-TR')} TL\n\n`;
    });

    message += `---\n`;
    message += `Toplam: ${total.toLocaleString('tr-TR')} TL\n\n`;
    message += `Lütfen sipariş detayları ve kargo bilgisi için dönüş yapınız.`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage();
    const phone = '905334862899';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Cart Panel - Full screen on mobile */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] md:w-[450px] bg-[#FDF8F3] z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E8C9A8] bg-white">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C1810]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Sepetim
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[#6B5344]">
                ({items.length} ürün)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-[#F5EDE4] rounded-full transition-colors touch-manipulation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D4A574"
                strokeWidth="1"
                className="mx-auto mb-4 opacity-50"
              >
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
                <path d="M6 6L5 3H2" />
              </svg>
              <p className="text-[#6B5344] mb-4">Sepetiniz boş</p>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl p-3 sm:p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-[#2C1810] text-sm sm:text-base truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B5344]">
                        {item.product.price.toLocaleString('tr-TR')} TL / {item.product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors touch-manipulation flex-shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-[#E8C9A8] rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 sm:px-4 py-2 hover:bg-[#F5EDE4] transition-colors touch-manipulation text-lg font-medium"
                      >
                        −
                      </button>
                      <span className="px-3 sm:px-4 py-2 font-semibold text-[#2C1810] min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 sm:px-4 py-2 hover:bg-[#F5EDE4] transition-colors touch-manipulation text-lg font-medium"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-[#D4A574] text-base sm:text-lg">
                      {(item.product.price * item.quantity).toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={onClear}
                className="w-full text-center text-sm text-red-500 hover:text-red-600 py-3 touch-manipulation"
              >
                Sepeti Temizle
              </button>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        {items.length > 0 && (
          <div className="bg-white border-t border-[#E8C9A8] p-4 sm:p-6 safe-area-bottom">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base sm:text-lg text-[#4A3728]">Toplam:</span>
              <span className="text-xl sm:text-2xl font-bold text-[#2C1810]">
                {total.toLocaleString('tr-TR')} TL
              </span>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              className="whatsapp-btn w-full justify-center text-base sm:text-lg py-4 touch-manipulation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp ile Sipariş Ver
            </button>

            <p className="text-xs text-center text-[#6B5344] mt-3">
              * Kargo ücreti fiyatlara dahil değildir
            </p>
          </div>
        )}
      </div>
    </>
  );
}
