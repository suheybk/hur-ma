// Cloudflare Pages (next-on-pages) dinamik rotaların edge çalışma ortamında
// olmasını ister. page.tsx bir istemci bileşeni olduğu için ayar burada.
export const runtime = 'edge';

export default function UrunLayout({ children }: { children: React.ReactNode }) {
  return children;
}
