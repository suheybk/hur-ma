'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartItem } from '@/lib/types';

interface FAQItem {
    question: string;
    answer: string;
}

export default function SSSPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        const savedCart = localStorage.getItem('hur-ma-cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    const faqs: FAQItem[] = [
        {
            question: 'Hurmalar nereden tedarik ediliyor?',
            answer: 'Tüm hurmalarımız doğrudan Medine-i Münevvere\'nin bereketli bahçelerinden tedarik edilmektedir. Aracısız çalışarak en taze ve kaliteli ürünleri sizlere ulaştırıyoruz.'
        },
        {
            question: 'Sipariş nasıl verebilirim?',
            answer: 'Siparişlerinizi web sitemiz üzerinden sepetinize ürün ekleyerek veya doğrudan WhatsApp hattımızdan (+90 533 486 28 99) iletişime geçerek verebilirsiniz. WhatsApp ile sipariş vermek en hızlı yöntemdir.'
        },
        {
            question: 'Kargo süresi ne kadar?',
            answer: 'Siparişleriniz 1-2 iş günü içinde kargoya verilmektedir. Türkiye genelinde teslimat süresi 2-4 iş günüdür. İstanbul, Ankara ve İzmir gibi büyük şehirlere teslimat genellikle 2 iş günü içinde yapılmaktadır.'
        },
        {
            question: 'Kargo ücreti ne kadar?',
            answer: 'Kargo ücreti alıcıya aittir. Tüm siparişler karşı ödemeli olarak gönderilmektedir. Ücret, kargo firmasının tarifesine göre teslimat sırasında alıcı tarafından ödenir.'
        },
        {
            question: 'Ödeme seçenekleri nelerdir?',
            answer: 'Kapıda ödeme (nakit veya kredi kartı), havale/EFT ve online kredi kartı ile ödeme seçeneklerimiz mevcuttur. Kurumsal siparişler için fatura kesiyoruz.'
        },
        {
            question: 'Hurmaların son kullanma tarihi ne kadar?',
            answer: 'Hurmalarımız uygun koşullarda 6-12 ay arasında taze kalır. Her pakette üretim ve son kullanma tarihi belirtilmektedir. Serin ve kuru yerde muhafaza etmenizi öneririz.'
        },
        {
            question: 'Toptan satış yapıyor musunuz?',
            answer: 'Evet, toptan satış yapmaktayız. İşletmeler, marketler ve kurumsal müşterilerimize özel fiyatlar sunuyoruz. Toptan sipariş için lütfen WhatsApp üzerinden bizimle iletişime geçin.'
        },
        {
            question: 'Ürün değişimi veya iadesi yapılıyor mu?',
            answer: 'Kalite garantimiz kapsamında, ürünle ilgili herhangi bir sorun yaşamanız durumunda değişim veya iade işlemi yapıyoruz. Ürünü teslim aldıktan sonra 7 gün içinde bizimle iletişime geçmeniz yeterlidir.'
        },
        {
            question: 'Hurmaları nasıl saklamalıyım?',
            answer: 'Hurmalarınızı serin ve kuru bir ortamda, direkt güneş ışığından uzakta saklayın. Buzdolabında saklamak raf ömrünü uzatır. Dondurucuda 1 yıla kadar saklayabilirsiniz.'
        },
        {
            question: 'Hediye paketi seçeneği var mı?',
            answer: 'Evet, özel günler için hediye paketi seçeneğimiz mevcuttur. Siparişinizi verirken hediye paketi istediğinizi belirtmeniz yeterlidir. Kurumsal hediyeler için özel fiyatlar sunuyoruz.'
        }
    ];

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
                        Sıkça Sorulan Sorular
                    </h1>
                    <p className="text-lg text-[#E8C9A8] max-w-2xl mx-auto">
                        Merak ettiğiniz her şeyin cevabı burada
                    </p>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FDF8F3] transition-colors"
                                >
                                    <span className="font-semibold text-[#2C1810] pr-4">
                                        {faq.question}
                                    </span>
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#D4A574"
                                        strokeWidth="2"
                                        className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                        }`}
                                >
                                    <div className="px-6 pb-5 text-[#6B5344] leading-relaxed border-t border-[#F5EDE4]">
                                        <p className="pt-4">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Still have questions */}
                    <div className="mt-12 text-center bg-gradient-to-r from-[#D4A574] to-[#B8956A] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[#2C1810] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Başka Sorunuz mu Var?
                        </h2>
                        <p className="text-[#4A3728] mb-6">
                            WhatsApp üzerinden bize ulaşın, tüm sorularınızı yanıtlayalım
                        </p>
                        <a
                            href="https://wa.me/905334862899"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-btn inline-flex"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp ile Soru Sor
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
