'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartItem } from '@/lib/types';

export default function IletisimPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('hur-ma-cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // WhatsApp mesajı oluştur
        const message = `Merhaba, size web sitesi üzerinden ulaşıyorum.

Ad Soyad: ${formData.name}
E-posta: ${formData.email}
Telefon: ${formData.phone}

Mesaj:
${formData.message}`;

        const whatsappUrl = `https://wa.me/905334862899?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    return (
        <main className="min-h-screen bg-[#FDF8F3]">
            <Header cartItems={cartItems} onCartClick={() => { }} />

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 bg-gradient-to-br from-[#2C1810] to-[#4A3728] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        İletişim
                    </h1>
                    <p className="text-lg text-[#E8C9A8] max-w-2xl mx-auto">
                        Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h2
                                className="text-2xl font-bold text-[#2C1810]"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                İletişim Bilgileri
                            </h2>

                            <div className="space-y-4">
                                {/* WhatsApp */}
                                <a
                                    href="https://wa.me/905334862899"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#2C1810]">WhatsApp</h3>
                                        <p className="text-[#6B5344]">+90 533 486 28 99</p>
                                        <p className="text-sm text-[#D4A574]">Hemen mesaj gönderin →</p>
                                    </div>
                                </a>

                                {/* Phone */}
                                <a
                                    href="tel:+905334862899"
                                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#2C1810]">Telefon</h3>
                                        <p className="text-[#6B5344]">+90 533 486 28 99</p>
                                    </div>
                                </a>

                                {/* Address */}
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md">
                                    <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#2C1810]">Adres</h3>
                                        <p className="text-[#6B5344]">
                                            Şenyuva Mahallesi Seyhan Caddesi<br />
                                            Büyük Ankara Camii Külliyesi 11-C/16<br />
                                            Keçiören / ANKARA
                                        </p>
                                    </div>
                                </div>

                                {/* Working Hours */}
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md">
                                    <div className="w-12 h-12 bg-[#D4A574] rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 6v6l4 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#2C1810]">Çalışma Saatleri</h3>
                                        <p className="text-[#6B5344]">
                                            Pazartesi - Cumartesi: 09:00 - 18:00<br />
                                            Pazar: Kapalı
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                            <h2
                                className="text-2xl font-bold text-[#2C1810] mb-6"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                Bize Yazın
                            </h2>

                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="text-5xl mb-4">✅</div>
                                    <h3 className="text-xl font-semibold text-[#2C1810] mb-2">
                                        Mesajınız Hazır!
                                    </h3>
                                    <p className="text-[#6B5344] mb-4">
                                        WhatsApp&apos;ta mesajınızı göndermek için açılan pencereyi kullanın.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="btn-secondary"
                                    >
                                        Yeni Mesaj Gönder
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#4A3728] mb-1">
                                            Ad Soyad *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full"
                                            placeholder="Adınız Soyadınız"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#4A3728] mb-1">
                                            E-posta
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full"
                                            placeholder="ornek@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#4A3728] mb-1">
                                            Telefon *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            className="w-full"
                                            placeholder="05XX XXX XX XX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#4A3728] mb-1">
                                            Mesajınız *
                                        </label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            rows={4}
                                            className="w-full"
                                            placeholder="Mesajınızı buraya yazın..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="whatsapp-btn w-full justify-center"
                                        disabled={isSubmitting}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        WhatsApp ile Gönder
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
