'use client';

import { useState } from 'react';

interface CheckoutFormProps {
    onSubmit: (formData: FormData) => Promise<void>;
    isLoading: boolean;
    onCancel: () => void;
    totalAmount: number;
}

export default function CheckoutForm({ onSubmit, isLoading, onCancel, totalAmount }: CheckoutFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        district: '',
        address: '',
    });
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        if (file) {
            data.append('receipt', file);
        }
        await onSubmit(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2C1810]">Ad Soyad</label>
                <input
                    type="text"
                    name="name"
                    required
                    placeholder="Adınız Soyadınız"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#E8C9A8] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2C1810]">Telefon</label>
                <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="05XX XXX XX XX"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#E8C9A8] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2C1810]">İl</label>
                    <input
                        type="text"
                        name="city"
                        required
                        placeholder="İl"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-[#E8C9A8] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#2C1810]">İlçe</label>
                    <input
                        type="text"
                        name="district"
                        required
                        placeholder="İlçe"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-[#E8C9A8] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2C1810]">Adres</label>
                <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="Mahalle, Sokak, No, Daire..."
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-[#E8C9A8] focus:outline-none focus:ring-2 focus:ring-[#D4A574]"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-[#2C1810]">
                    Ödeme Dekontu (İsteğe Bağlı)
                </label>
                <div className="flex items-center space-x-2">
                    <label className="cursor-pointer bg-white px-4 py-2 border border-[#E8C9A8] rounded-lg hover:bg-[#FDF8F3] transition-colors">
                        <span className="text-sm text-[#6B5344]">Dosya Seç</span>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                    <span className="text-sm text-[#8C7B70]">
                        {file ? file.name : 'Dosya seçilmedi'}
                    </span>
                </div>
                <p className="text-xs text-[#8C7B70]">
                    IBAN: TRXX XXXX... (Alıcı Adı) hesabına <strong>{totalAmount.toLocaleString('tr-TR')} TL</strong> gönderdikten sonra dekont yükleyebilirsiniz.
                </p>
            </div>

            <div className="pt-4 flex items-center gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                    Geri Dön
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 rounded-lg bg-[#D4A574] text-white font-medium hover:bg-[#C29060] transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Siparişi Tamamla'
                    )}
                </button>
            </div>
        </form>
    );
}
