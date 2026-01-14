import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hur-ma | Premium Hurma",
  description: "En kaliteli Medine hurmaları. Acve, Mejdul, Amber, Sukkari ve daha fazlası. Doğrudan tedarikçiden sofranıza.",
  keywords: "hurma, medine hurması, acve, mejdul, amber, sukkari, mebrum, safavi",
  openGraph: {
    title: "hur-ma | Premium Hurma",
    description: "En kaliteli Medine hurmaları. Doğrudan tedarikçiden sofranıza.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/hurma-icons/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
