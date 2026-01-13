'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { Product } from '@/lib/types';

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  isActive: boolean;
  order: number;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: 0,
  unit: 'KG',
  category: 'klasik',
  isActive: true,
  order: 0,
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('hur-ma-admin');
    if (token === 'authenticated') {
      setIsLoggedIn(true);
      loadProducts();
    }
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production use proper auth
    if (password === 'hurma2024') {
      localStorage.setItem('hur-ma-admin', 'authenticated');
      setIsLoggedIn(true);
      loadProducts();
    } else {
      setMessage({ type: 'error', text: 'Yanlış şifre!' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hur-ma-admin');
    setIsLoggedIn(false);
    setPassword('');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      const url = editingProduct.id
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ürün kaydedildi!' });
        setEditingProduct(null);
        loadProducts();
      } else {
        setMessage({ type: 'error', text: 'Hata oluştu!' });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({ type: 'error', text: 'Hata oluştu!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Ürün silindi!' });
        loadProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'premium', name: 'Premium' },
    { id: 'klasik', name: 'Klasik' },
    { id: 'ekonomik', name: 'Ekonomik' },
    { id: 'ozel', name: 'Özel' },
    { id: 'kutu', name: 'Kutu' },
  ];

  const units = ['KG', 'PAKET', 'ADET'];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-center text-[#2C1810] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Admin Paneli
          </h1>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4A3728] mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Admin şifresi"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Giriş Yap
            </button>
          </form>
          
          <a href="/" className="block text-center mt-4 text-[#D4A574] hover:text-[#B8956A]">
            ← Siteye Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EDE4]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-[#6B5344]">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-[#D4A574] hover:text-[#B8956A]">
              Siteyi Görüntüle
            </a>
            <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {/* Product Form Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#E8C9A8]">
                <h2 className="text-xl font-bold text-[#2C1810]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {editingProduct.id ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
              </div>
              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#4A3728] mb-1">
                      Ürün Adı *
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#4A3728] mb-1">
                      Açıklama
                    </label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A3728] mb-1">
                      Fiyat (TL) *
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A3728] mb-1">
                      Birim
                    </label>
                    <select
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A3728] mb-1">
                      Kategori
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A3728] mb-1">
                      Sıra
                    </label>
                    <input
                      type="number"
                      value={editingProduct.order}
                      onChange={(e) => setEditingProduct({ ...editingProduct, order: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isActive}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                        className="w-5 h-5 rounded border-[#E8C9A8] text-[#D4A574] focus:ring-[#D4A574]"
                      />
                      <span className="text-sm text-[#4A3728]">Aktif (sitede görünsün)</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1 justify-center" disabled={isLoading}>
                    {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="btn-secondary flex-1"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-[#E8C9A8] flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2C1810]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ürünler ({products.length})
            </h2>
            <button
              onClick={() => setEditingProduct(emptyForm)}
              className="btn-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Yeni Ürün
            </button>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="p-12 text-center text-[#6B5344]">Yükleniyor...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-[#6B5344]">
              Henüz ürün yok. Yeni ürün ekleyerek başlayın.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5EDE4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A3728] uppercase">Sıra</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A3728] uppercase">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A3728] uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A3728] uppercase">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A3728] uppercase">Durum</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#4A3728] uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EDE4]">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#FDF8F3]">
                      <td className="px-6 py-4 text-sm text-[#6B5344]">{product.order}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#2C1810]">{product.name}</div>
                        <div className="text-sm text-[#6B5344] truncate max-w-xs">{product.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-[#2C1810] font-medium">
                        {product.price.toLocaleString('tr-TR')} TL / {product.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingProduct({
                              id: product.id,
                              name: product.name,
                              description: product.description || '',
                              price: product.price,
                              unit: product.unit,
                              category: product.category,
                              isActive: product.isActive,
                              order: product.order,
                            })}
                            className="p-2 hover:bg-[#F5EDE4] rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
