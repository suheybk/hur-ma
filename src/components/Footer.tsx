'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2C1810] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 [&_span]:!text-white">
              <Logo size="lg" />
            </div>
            <p className="text-[#E8C9A8] text-sm leading-relaxed">
              Medine&apos;nin en kaliteli hurmalarını doğrudan sofranıza getiriyoruz.
              Taze, doğal ve lezzetli hurmalar için bize ulaşın.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Hızlı Bağlantılar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-[#E8C9A8] hover:text-[#D4A574] transition-colors text-sm">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/#urunler" className="text-[#E8C9A8] hover:text-[#D4A574] transition-colors text-sm">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-[#E8C9A8] hover:text-[#D4A574] transition-colors text-sm">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-[#E8C9A8] hover:text-[#D4A574] transition-colors text-sm">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-[#E8C9A8] hover:text-[#D4A574] transition-colors text-sm">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              İletişim
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <a
                  href="tel:+905334862899"
                  className="flex items-center gap-3 text-[#E8C9A8] hover:text-[#D4A574] transition-colors group"
                >
                  <div className="p-2 rounded-full bg-[#D4A574]/10 group-hover:bg-[#D4A574]/20 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <span className="text-sm">+90 533 486 28 99</span>
                </a>
                <div className="flex items-start gap-3 group">
                  <div className="p-2 rounded-full bg-[#D4A574]/10 group-hover:bg-[#D4A574]/20 transition-colors mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span className="text-[#E8C9A8] text-sm py-2">
                    Şenyuva Mah. Seyhan Cad.<br />
                    Keçiören / ANKARA
                  </span>
                </div>
              </div>
              <div>
                <a
                  href="https://wa.me/905334862899"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-[#128C7E] transition-colors touch-manipulation shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[#4A3728]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-[#E8C9A8] text-center sm:text-left">
              © {currentYear} hur-ma.com - Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-[#6B5344] text-center sm:text-right">
              * Fiyatlar güncel Riyal kuruna endekslidir.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
