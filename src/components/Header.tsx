'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { Icons } from './Icons';
import { CartItem } from '@/lib/types';

interface HeaderProps {
  cartItems: CartItem[];
  onCartClick: () => void;
}

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/#urunler', label: 'Ürünler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/iletisim', label: 'İletişim' },
  { href: '/sss', label: 'SSS' },
];

export default function Header({ cartItems, onCartClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (href: string) => {
    if (href.includes('#')) {
      const id = href.split('#')[1];
      if (pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-sm xl:text-base font-medium transition-colors ${pathname === link.href || (link.href === '/' && pathname === '/')
                    ? 'text-[#D4A574]'
                    : 'text-[#4A3728] hover:text-[#D4A574]'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2.5 sm:p-3 rounded-full bg-[#D4A574] hover:bg-[#B8956A] transition-all duration-300 hover:scale-105 touch-manipulation group"
              >
                <Icons.Cart className="text-[#2C1810] sm:w-6 sm:h-6 w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#2C1810] text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#F5EDE4] transition-colors touch-manipulation"
                aria-label="Menü"
              >
                <Icons.Menu className="text-[#2C1810] w-6 h-6" isOpen={isMobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white z-50 transform transition-transform duration-300 ease-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E8C9A8]/30">
            <span className="font-serif font-bold text-[#2C1810] text-lg">Menü</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#F5EDE4] transition-colors"
            >
              <Icons.Menu className="text-[#2C1810] w-6 h-6" isOpen={true} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors touch-manipulation ${pathname === link.href
                  ? 'bg-[#D4A574] text-[#2C1810]'
                  : 'text-[#4A3728] hover:bg-[#F5EDE4]'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* WhatsApp CTA */}
          <div className="p-4 border-t border-[#E8C9A8]/30">
            <a
              href="https://wa.me/905334862899"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#128C7E] transition-colors touch-manipulation shadow-md"
            >
              <Icons.WhatsApp className="w-5 h-5" />
              WhatsApp ile İletişim
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
