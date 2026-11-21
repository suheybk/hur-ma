'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { useCart } from '@/lib/useCart';

const OYUN_ADRESI = '/fesile/index.html';

export default function OyunPage() {
  const cart = useCart();

  return (
    <main className="min-h-screen bg-[#FDF8F3]">
      <Header cartItems={cart.cartItems} onCartClick={cart.openCart} />
      <Cart
        isOpen={cart.isCartOpen}
        onClose={cart.closeCart}
        items={cart.cartItems}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeFromCart}
        onClear={cart.clearCart}
      />

      <section className="pt-[4.5rem] sm:pt-[5.5rem] pb-4 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Oyun, sabit menünün hemen altında ve ekrana sığacak boyda */}
          <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-[#070b18] h-[calc(100svh-5.5rem)] sm:h-[calc(100svh-7rem)] min-h-[420px] max-h-[860px]">
            <iframe
              src={OYUN_ADRESI}
              title="Fesîle — Hurmanın Yaratılışı"
              className="absolute inset-0 w-full h-full border-0 block"
              allow="fullscreen; autoplay"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="pt-6 pb-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[#B8956A] mb-2">
            Hurma · Yedi sahne
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-3"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Fesîle — Hurmanın Yaratılışı
          </h1>
          <p className="text-[#6B5344] mb-6">
            Çekirdekten köke, kökten salkıma… Hurmanın yolculuğunu yedi sahnede izle. Yalnızca
            fareyi gezdirmen yeter; telefonda parmağını sürükle. Ses için &quot;Başla&quot;ya bas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={OYUN_ADRESI} className="btn-primary">
              Tam sayfada oyna
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </a>
            <Link href="/#urunler" className="btn-secondary">
              Hurma çeşitlerimizi gör
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
