import { createPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { DISCOUNT_CODES } from '@/lib/discounts';

export const runtime = 'edge';

// Dekont D1'e base64 olarak yazılır; D1 satır sınırı 2 MB olduğundan ham dosya en çok ~1,4 MB.
const EN_BUYUK_DEKONT = 1.4 * 1024 * 1024;
const DEKONT_TURLERI = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/;
const metin = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const kurus = (n: number) => Math.round(n * 100) / 100;

export async function POST(request: Request) {
    try {
        const { env } = (getRequestContext() as any);
        const prisma = createPrismaClient(env.DB);

        const formData = await request.formData();

        // Extract fields
        const name = metin(formData.get('name'), 120);
        const phone = metin(formData.get('phone'), 30);
        const city = metin(formData.get('city'), 60);
        const district = metin(formData.get('district'), 60);
        const address = metin(formData.get('address'), 500);
        const totalAmountStr = metin(formData.get('totalAmount'), 30);
        const itemsJson = metin(formData.get('items'), 20000);
        const discountCode = metin(formData.get('discountCode'), 40);

        // Handle receipt file - check if it's a File object
        const receiptEntry = formData.get('receipt');
        const receiptFile = (receiptEntry instanceof File) ? receiptEntry : null;

        // Validation
        if (!name || !phone || !address || !city) {
            return NextResponse.json({ error: 'Ad, telefon, il ve adres zorunludur' }, { status: 400 });
        }
        if (receiptFile && receiptFile.size > 0) {
            if (receiptFile.size > EN_BUYUK_DEKONT) {
                return NextResponse.json({ error: 'Dekont dosyası en fazla 1,4 MB olabilir. Lütfen daha küçük bir fotoğraf ya da ekran görüntüsü yükleyin.' }, { status: 400 });
            }
            if (!DEKONT_TURLERI.test(receiptFile.type)) {
                return NextResponse.json({ error: 'Dekont JPG, PNG, WEBP, HEIC ya da PDF olmalı' }, { status: 400 });
            }
        }
        if (!itemsJson) {
            return NextResponse.json({ error: 'Sepet verisi eksik' }, { status: 400 });
        }

        const totalAmount = parseFloat(totalAmountStr);
        if (isNaN(totalAmount)) {
            return NextResponse.json({ error: 'Geçersiz toplam tutar' }, { status: 400 });
        }

        let items;
        try {
            items = JSON.parse(itemsJson);
        } catch (e) {
            return NextResponse.json({ error: 'Geçersiz sepet formatı' }, { status: 400 });
        }

        // Fiyatlar tarayıcıya güvenilmez: ürün fiyatları veritabanından alınır,
        // toplam sunucuda hesaplanır.
        if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
            return NextResponse.json({ error: 'Geçersiz sepet' }, { status: 400 });
        }
        const satirlar: { productId: string; quantity: number }[] = [];
        for (const it of items) {
            const productId = typeof it?.productId === 'string' ? it.productId : '';
            const quantity = Number(it?.quantity);
            if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
                return NextResponse.json({ error: 'Geçersiz sepet satırı' }, { status: 400 });
            }
            satirlar.push({ productId, quantity });
        }
        const idler = [...new Set(satirlar.map((x) => x.productId))];
        const urunler = await prisma.product.findMany({
            where: { id: { in: idler }, isActive: true },
            select: { id: true, price: true },
        });
        const fiyat = new Map(urunler.map((u) => [u.id, u.price]));
        if (idler.some((id) => !fiyat.has(id))) {
            return NextResponse.json({ error: 'Sepetteki bazı ürünler artık satışta değil. Lütfen sepetinizi yenileyin.' }, { status: 409 });
        }
        const araToplam = satirlar.reduce((t, x) => t + (fiyat.get(x.productId) as number) * x.quantity, 0);
        const indirimOrani = DISCOUNT_CODES[discountCode] ?? 0;
        const sunucuToplami = kurus(araToplam * (1 - indirimOrani));
        if (Math.abs(sunucuToplami - totalAmount) > 0.01) {
            return NextResponse.json({ error: 'Fiyatlar güncellenmiş. Lütfen sepetinizi yenileyip tekrar deneyin.' }, { status: 409 });
        }

        // Kişisel veriler (ad, telefon, adres) loglara yazılmaz.
        console.log('Order request:', { items: satirlar.length, total: sunucuToplami, receipt: !!receiptFile?.size });

        let receiptPath: string | null = null;

        // Dekont: Cloudflare edge ortamında dosya sistemi yoktur; dosya veritabanına
        // data URL (base64) olarak yazılır.
        if (receiptFile && receiptFile.size > 0) {
            const bytes = new Uint8Array(await receiptFile.arrayBuffer());
            let ikili = '';
            for (let i = 0; i < bytes.length; i += 0x8000) {
                ikili += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
            }
            receiptPath = `data:${receiptFile.type};base64,${btoa(ikili)}`;
        }

        // Create Order in DB
        console.log('Creating order in database...');
        try {
            const order = await prisma.order.create({
                data: {
                    customerName: name || '',
                    customerPhone: phone || '',
                    address: address || '',
                    city: city || '',
                    district: district || '',
                    totalAmount: sunucuToplami,
                    receiptPath,
                    status: 'PENDING',
                    items: {
                        create: satirlar.map((x) => ({
                            productId: x.productId,
                            quantity: x.quantity,
                            price: fiyat.get(x.productId) as number,
                        }))
                    }
                }
            });

            console.log('Order created successfully:', order.id);
            const orderNo = order.id.slice(-6).toUpperCase();
            return NextResponse.json({ success: true, orderId: order.id, orderNo });

        } catch (prismaError) {
            console.error('Detailed Prisma Error:', prismaError);
            throw prismaError;
        }

    } catch (error) {
        console.error('Order Error Details:', error);
        const gelistirme = process.env.NODE_ENV === 'development';
        return NextResponse.json({
            error: 'Sipariş oluşturulurken bir hata oluştu',
            // iç ayrıntılar yalnız geliştirmede gösterilir
            details: gelistirme ? (error instanceof Error ? error.message : String(error)) : undefined,
            stack: gelistirme ? (error instanceof Error ? error.stack : undefined) : undefined
        }, { status: 500 });
    }
}
