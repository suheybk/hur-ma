'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { useCart } from '@/lib/useCart';

export default function HakkimizdaPage() {
    const cart = useCart();


    const benefits = [
        {
            icon: '💪',
            title: 'Enerji Kaynağı',
            desc: 'Hurma, doğal şekerleri sayesinde anında enerji sağlar. Sporcular ve aktif yaşam sürenler için mükemmel bir atıştırmalıktır.'
        },
        {
            icon: '🫀',
            title: 'Kalp Sağlığı',
            desc: 'Potasyum açısından zengin olan hurma, kan basıncını düzenlemeye ve kalp sağlığını korumaya yardımcı olur.'
        },
        {
            icon: '🦴',
            title: 'Kemik Güçlendirici',
            desc: 'Kalsiyum, magnezyum ve fosfor içeriği ile kemik sağlığını destekler, osteoporoz riskini azaltır.'
        },
        {
            icon: '🧠',
            title: 'Beyin Fonksiyonları',
            desc: 'B vitaminleri ve antioksidanlar sayesinde beyin sağlığını destekler, hafızayı güçlendirir.'
        },
        {
            icon: '🌿',
            title: 'Sindirim Düzenleyici',
            desc: 'Yüksek lif içeriği ile sindirim sistemini düzenler, kabızlık sorunlarını önlemeye yardımcı olur.'
        },
        {
            icon: '🛡️',
            title: 'Bağışıklık Güçlendirici',
            desc: 'Antioksidanlar ve vitaminler sayesinde bağışıklık sistemini güçlendirir, hastalıklara karşı korur.'
        }
    ];

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

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#2C1810] to-[#4A3728] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Hakkımızda
                    </h1>
                    <p className="text-lg text-[#E8C9A8] max-w-2xl mx-auto">
                        Medine&apos;nin en kaliteli hurmalarını Türkiye&apos;ye ulaştırıyoruz
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
                        <h2
                            className="text-2xl sm:text-3xl font-bold text-[#2C1810] mb-6"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            Hikayemiz
                        </h2>
                        <div className="space-y-4 text-[#4A3728] leading-relaxed">
                            <p>
                                <strong>hur-ma.com</strong> olarak, Medine-i Münevvere&apos;nin bereketli topraklarından
                                yetişen en kaliteli hurmaları sizlere ulaştırmak amacıyla yola çıktık.
                            </p>
                            <p>
                                Hurma, Hz. Peygamber (s.a.v) Efendimiz&apos;in sevdiği ve tavsiye ettiği mübarek bir meyvedir.
                                Hadis-i şeriflerde hurmanın faydaları ve önemi sıkça vurgulanmıştır.
                            </p>
                            <p>
                                Biz de bu mübarek meyveyi, en taze ve en kaliteli haliyle sizlerin sofralarına
                                taşımayı kendimize görev edindik. Doğrudan Medine bahçelerinden tedarik ettiğimiz
                                hurmalarımız, özenli paketleme ve hızlı kargo ile kapınıza ulaşmaktadır.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-4 bg-[#F5EDE4]">
                <div className="max-w-6xl mx-auto">
                    <h2
                        className="text-2xl sm:text-3xl font-bold text-[#2C1810] text-center mb-12"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Hurmanın Faydaları
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <span className="text-4xl mb-4 block">{benefit.icon}</span>
                                <h3 className="text-lg font-semibold text-[#2C1810] mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-sm text-[#6B5344] leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2
                        className="text-2xl sm:text-3xl font-bold text-[#2C1810] text-center mb-12"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Neden Biz?
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🌴</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#2C1810] mb-1">Doğrudan Medine&apos;den</h3>
                                <p className="text-sm text-[#6B5344]">Aracısız, doğrudan bahçelerden tedarik</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#2C1810] mb-1">Kalite Garantisi</h3>
                                <p className="text-sm text-[#6B5344]">Her ürün özenle kontrol edilir</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🚚</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#2C1810] mb-1">Hızlı Teslimat</h3>
                                <p className="text-sm text-[#6B5344]">Türkiye geneli güvenli kargo</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-xl shadow-md">
                            <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💬</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#2C1810] mb-1">7/24 Destek</h3>
                                <p className="text-sm text-[#6B5344]">WhatsApp üzerinden anında iletişim</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
