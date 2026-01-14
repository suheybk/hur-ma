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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E8C9A8]/30 bg-white/50 backdrop-blur glass-panel">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2C1810] font-serif">
            Sepetim
            {items.length > 0 && (
              <span className="ml-2 text-sm font-sans font-normal text-[#6B5344]">
                ({items.length} ürün)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5EDE4] rounded-full transition-colors touch-manipulation text-[#2C1810]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-20 h-20 bg-[#E8C9A8]/20 rounded-full flex items-center justify-center mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <p className="text-[#6B5344] mb-6 text-lg">Sepetiniz henüz boş</p>
              <button
                onClick={onClose}
                className="btn-primary shadow-md hover:shadow-lg"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#E8C9A8]/20 hover:border-[#E8C9A8]/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-serif font-bold text-[#2C1810] text-lg truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-[#8C7B70]">
                        {item.product.price.toLocaleString('tr-TR')} TL / {item.product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-full transition-colors touch-manipulation"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-[#FDF8F3] rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#2C1810] hover:bg-white rounded-md transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-10 text-center font-bold text-[#2C1810]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#2C1810] hover:bg-white rounded-md transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>

                    <span className="font-serif font-bold text-[#D4A574] text-lg">
                      {(item.product.price * item.quantity).toLocaleString('tr-TR')} TL
                    </span>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={onClear}
                className="w-full text-center text-sm text-[#8C7B70] hover:text-red-500 py-4 transition-colors underline decoration-dotted underline-offset-4"
              >
                Sepeti Temizle
              </button>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        {items.length > 0 && (
          <div className="bg-white border-t border-[#E8C9A8]/30 p-4 sm:p-6 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-[#4A3728]">Toplam Tutar</span>
              <span className="text-2xl font-bold text-[#2C1810] font-serif">
                {total.toLocaleString('tr-TR')} TL
              </span>
            </div>

            <button
              onClick={handleWhatsAppOrder}
              className="whatsapp-btn w-full justify-center text-lg py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp ile Sipariş Ver</span>
            </button>

            <p className="text-xs text-center text-[#8C7B70] mt-4 flex items-center justify-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Kargo ücreti alıcıya aittir (Karşı ödemeli gönderilir)
            </p>
          </div>
        )}
      </div>
    </>
  );
}
