'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { Product, CartItem } from '@/lib/types';
import Link from 'next/link';

export default function UrunDetayPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('hur-ma-cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('hur-ma-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const products = await res.json();
                    const found = products.find((p: Product) => p.id === params.id);
                    setProduct(found || null);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const handleAddToCart = () => {
        if (!product) return;

        setCartItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleUpdateQuantity = (productId: string, qty: number) => {
        if (qty <= 0) {
            setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
            return;
        }
        setCartItems((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity: qty } : item
            )
        );
    };

    const handleRemoveFromCart = (productId: string) => {
        setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
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

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#FDF8F3]">
                <Header cartItems={cartItems} onCartClick={() => setIsCartOpen(true)} />
                <div className="pt-32 pb-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-64 bg-[#E8C9A8] rounded-2xl mb-6"></div>
                            <div className="h-8 bg-[#E8C9A8] rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-[#E8C9A8] rounded w-full mb-2"></div>
                            <div className="h-4 bg-[#E8C9A8] rounded w-3/4"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-[#FDF8F3]">
                <Header cartItems={cartItems} onCartClick={() => setIsCartOpen(true)} />
                <div className="pt-32 pb-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="text-6xl mb-4">🌴</div>
                        <h1 className="text-2xl font-bold text-[#2C1810] mb-4">Ürün Bulunamadı</h1>
                        <p className="text-[#6B5344] mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
                        <Link href="/#urunler" className="btn-primary">
                            Ürünlere Dön
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    const badge = getCategoryBadge(product.category);

    return (
        <main className="min-h-screen bg-[#FDF8F3]">
            <Header cartItems={cartItems} onCartClick={() => setIsCartOpen(true)} />
            <Cart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onClear={() => setCartItems([])}
            />

            {/* Breadcrumb */}
            <div className="pt-24 pb-4 px-4 bg-[#F5EDE4]">
                <div className="max-w-6xl mx-auto">
                    <nav className="flex items-center gap-2 text-sm text-[#6B5344]">
                        <Link href="/" className="hover:text-[#D4A574]">Ana Sayfa</Link>
                        <span>/</span>
                        <Link href="/#urunler" className="hover:text-[#D4A574]">Ürünler</Link>
                        <span>/</span>
                        <span className="text-[#2C1810]">{product.name}</span>
                    </nav>
                </div>
            </div>

            {/* Product Detail */}
            <section className="py-8 sm:py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                        {/* Product Image */}
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-[#E8C9A8] to-[#D4A574] rounded-2xl flex items-center justify-center overflow-hidden">
                                <svg
                                    width="200"
                                    height="200"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    className="opacity-40"
                                >
                                    <ellipse cx="16" cy="18" rx="7" ry="10" fill="#4A3728" />
                                    <ellipse cx="16" cy="18" rx="5" ry="8" fill="#6B5344" />
                                    <path d="M16 6 Q20 2 24 4 Q20 6 16 8 Z" fill="#4A3728" opacity="0.5" />
                                    <path d="M16 6 Q12 2 8 4 Q12 6 16 8 Z" fill="#4A3728" opacity="0.5" />
                                </svg>
                            </div>
                            <span className={`absolute top-4 left-4 ${badge.bg} text-white text-sm font-semibold px-4 py-2 rounded-full`}>
                                {badge.text}
                            </span>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <h1
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C1810] mb-4"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                {product.name}
                            </h1>

                            <p className="text-[#6B5344] mb-6 leading-relaxed">
                                {product.description || 'Premium kalite Medine hurması. Özenle seçilmiş, taze ve lezzetli.'}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-3xl sm:text-4xl font-bold text-[#D4A574]">
                                    {product.price.toLocaleString('tr-TR')} TL
                                </span>
                                <span className="text-lg text-[#6B5344]">/ {product.unit}</span>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-[#4A3728] mb-2">
                                    Miktar
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-[#E8C9A8] rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-3 hover:bg-[#F5EDE4] transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2">
                                                <path d="M5 12h14" />
                                            </svg>
                                        </button>
                                        <span className="px-6 py-3 font-semibold text-[#2C1810] text-lg min-w-[60px] text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-4 py-3 hover:bg-[#F5EDE4] transition-colors"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A3728" strokeWidth="2">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                        </button>
                                    </div>
                                    <span className="text-[#6B5344]">
                                        Toplam: <strong className="text-[#2C1810]">{(product.price * quantity).toLocaleString('tr-TR')} TL</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
                                            ? 'bg-green-500 text-white'
                                            : 'bg-[#D4A574] text-[#2C1810] hover:bg-[#B8956A]'
                                        }`}
                                >
                                    {isAdded ? (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                            Sepete Eklendi!
                                        </>
                                    ) : (
                                        <>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 6h15l-1.5 9h-12z" />
                                                <circle cx="9" cy="20" r="1" />
                                                <circle cx="18" cy="20" r="1" />
                                                <path d="M6 6L5 3H2" />
                                            </svg>
                                            Sepete Ekle
                                        </>
                                    )}
                                </button>
                                <a
                                    href={`https://wa.me/905334862899?text=${encodeURIComponent(`Merhaba, ${product.name} ürününü sipariş etmek istiyorum. Miktar: ${quantity} ${product.unit}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="whatsapp-btn justify-center"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                    Hemen Sipariş Ver
                                </a>
                            </div>

                            {/* Features */}
                            <div className="mt-8 pt-8 border-t border-[#E8C9A8]">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🌴</span>
                                        <span className="text-sm text-[#6B5344]">Medine&apos;den Doğrudan</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✅</span>
                                        <span className="text-sm text-[#6B5344]">Kalite Garantisi</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🚚</span>
                                        <span className="text-sm text-[#6B5344]">Hızlı Kargo</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💬</span>
                                        <span className="text-sm text-[#6B5344]">7/24 Destek</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
