// Gelen ürün verisini doğrula; hata varsa mesaj döner.
export function urunVerisi(body: unknown):
  | { ok: true; data: { name: string; description: string | null; price: number; unit: string; category: string; image: string | null; isActive: boolean; order: number } }
  | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Geçersiz veri' };
  const b = body as Record<string, unknown>;
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const price = typeof b.price === 'number' ? b.price : Number(b.price);
  if (!name || name.length > 120) return { ok: false, error: 'Ürün adı gerekli (en çok 120 karakter)' };
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) return { ok: false, error: "Fiyat 0'dan büyük olmalı" };
  const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
  const image = str(b.image, 300);
  if (image && !/^(\/|https:\/\/)/.test(image)) return { ok: false, error: 'Görsel yolu / veya https:// ile başlamalı' };
  return {
    ok: true,
    data: {
      name,
      description: str(b.description, 2000),
      price,
      unit: str(b.unit, 20) || 'KG',
      category: str(b.category, 30) || 'klasik',
      image,
      isActive: typeof b.isActive === 'boolean' ? b.isActive : true,
      order: Number.isInteger(b.order) ? (b.order as number) : 0,
    },
  };
}
