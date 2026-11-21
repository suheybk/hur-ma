'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/useCart';
import { initialProducts } from '@/lib/initialData';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const {
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
    clearCart: handleClearCart,
  } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load products from API or use initial data
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setProducts(data);
          } else {
            // Use initial data if no products in DB
            setProducts(initialProducts.map((p, i) => ({
              ...p,
              id: `temp-${i}`,
              image: null,
              isActive: true,
            })));
          }
        }
      } catch {
        // Fallback to initial data
        setProducts(initialProducts.map((p, i) => ({
          ...p,
          id: `temp-${i}`,
          image: null,
          isActive: true,
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'premium', name: 'Premium' },
    { id: 'klasik', name: 'Klasik' },
    { id: 'ekonomik', name: 'Ekonomik' },
    { id: 'ozel', name: 'Özel' },
    { id: 'kutu', name: 'Kutu' },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const benefits = [
    { icon: '🌿', title: 'Doğal & Taze', desc: 'Katkısız, doğal hurmalar' },
    { icon: '✈️', title: 'Hızlı Kargo', desc: 'Türkiye geneli teslimat' },
    { icon: '⭐', title: 'Premium Kalite', desc: 'En iyi Medine hurmaları' },
    { icon: '💬', title: 'Kolay Sipariş', desc: 'WhatsApp ile sipariş' },
  ];

  return (
    <main className="min-h-screen">
      <Header cartItems={cartItems} onCartClick={() => openCart()} />
      <Cart
        isOpen={isCartOpen}
        onClose={() => closeCart()}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onClear={handleClearCart}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pattern-bg">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDF8F3] via-[#F5EDE4] to-[#E8C9A8] opacity-90" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#D4A574] rounded-full opacity-10 animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#D4A574] rounded-full opacity-10 animate-float delay-300" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-8">
              <Logo size="xl" />
            </div>
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#2C1810] mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Premium Medine Hurması
            </h1>
            <p className="text-lg md:text-xl text-[#4A3728] mb-8 max-w-2xl mx-auto">
              Doğrudan Medine bahçelerinden sofranıza, en kaliteli ve taze hurmalar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#urunler" className="btn-primary text-lg">
                Ürünleri Keşfet
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="https://wa.me/905334862899"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-lg"
              >
                WhatsApp ile İletişim
              </a>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up delay-300">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="text-3xl mb-3 block">{benefit.icon}</span>
                <h3 className="font-semibold text-[#2C1810] mb-1">{benefit.title}</h3>
                <p className="text-sm text-[#6B5344]">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section id="urunler" className="py-20 bg-[#FDF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Hurma Çeşitlerimiz</h2>
            <p className="text-[#6B5344] mt-6 max-w-2xl mx-auto">
              Medine&apos;nin en seçkin bahçelerinden, özenle seçilmiş premium hurmalar
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-[#D4A574] text-[#2C1810] shadow-lg'
                    : 'bg-white text-[#4A3728] hover:bg-[#F5EDE4]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="h-48 bg-[#E8C9A8] rounded-xl mb-4" />
                  <div className="h-4 bg-[#E8C9A8] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#E8C9A8] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQuantity={getCartQuantity(product.id)}
                />
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-[#6B5344]">Bu kategoride ürün bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="hakkimizda" className="py-20 bg-[#2C1810] text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Hurmanın Faydaları
              </h2>
              <p className="text-[#E8C9A8] mb-6 leading-relaxed">
                Hurma, binlerce yıldır Ortadoğu&apos;nun temel gıdası olan mucizevi bir meyvedir. 
                Yüksek lif içeriği, zengin mineral deposu ve doğal enerji kaynağı olmasıyla 
                sağlıklı yaşamın vazgeçilmez bir parçasıdır.
              </p>
              <ul className="space-y-3">
                {[
                  'Sindirimi düzenlemeye yardımcı olur',
                  'Kan şekerini dengeler',
                  'Kalp sağlığını destekler',
                  'Kemik yapısını güçlendirir',
                  'Doğal enerji kaynağıdır',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#D4A574] rounded-full" />
                    <span className="text-[#E8C9A8]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#D4A574] to-[#B8956A] rounded-3xl p-8 text-center">
                <div className="text-6xl mb-4">🌴</div>
                <h3 className="text-2xl font-bold text-[#2C1810] mb-2">Medine Hurması</h3>
                <p className="text-[#4A3728]">
                  En kaliteli hurmalar, doğrudan Medine bahçelerinden
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Teaser */}
      <section className="py-16 sm:py-20 bg-[#070b18] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <Link href="/oyun" className="block rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 hover:ring-[#D4A574]/60 transition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fesile/og-gorsel.jpg" alt="Fesîle oyunundan bir sahne: gece gökyüzü altında hurma ağacı" className="w-full h-auto block" loading="lazy" />
          </Link>
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#D4A574] mb-3">Yeni · Yedi sahne</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Fesîle — Hurmanın Yaratılışı
            </h2>
            <p className="text-[#E8C9A8] mb-8 leading-relaxed">
              Çekirdekten köke, kökten salkıma… Hurmanın yolculuğunu yalnızca fareyi gezdirerek
              ya da parmağını sürükleyerek izleyeceğin kısa bir tefekkür oyunu.
            </p>
            <Link href="/oyun" className="btn-primary text-lg">
              Oyunu Oyna
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#D4A574] to-[#B8956A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Sipariş Vermek İster misiniz?
          </h2>
          <p className="text-[#4A3728] mb-8">
            WhatsApp üzerinden kolayca sipariş verebilir, sorularınızı sorabilirsiniz
          </p>
          <a
            href="https://wa.me/905334862899"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn text-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp ile Sipariş Ver
          </a>
        </div>
      </section>

      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/905334862899"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-gold"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </main>
  );
}
