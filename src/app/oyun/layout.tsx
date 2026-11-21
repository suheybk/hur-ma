import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fesîle — Hurmanın Yaratılışı | hur-ma',
  description:
    'Hurmanın yaratılışı, yedi sahnede. Yalnızca fare hareketiyle (telefonda parmak sürükleyerek) oynanan kısa bir tefekkür oyunu.',
  openGraph: {
    title: 'Fesîle — Hurmanın Yaratılışı',
    description: 'Hurmanın yaratılışı, yedi sahnede. Yalnızca fare hareketiyle oynanır.',
    images: ['/fesile/og-gorsel.jpg'],
    type: 'website',
    locale: 'tr_TR',
  },
};

export default function OyunLayout({ children }: { children: React.ReactNode }) {
  return children;
}
