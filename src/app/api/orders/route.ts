import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract fields
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const city = formData.get('city') as string;
        const district = formData.get('district') as string;
        const address = formData.get('address') as string;
        const totalAmountStr = formData.get('totalAmount') as string;
        const itemsJson = formData.get('items') as string;

        // Handle receipt file - check if it's a File object
        const receiptEntry = formData.get('receipt');
        const receiptFile = (receiptEntry instanceof File) ? receiptEntry : null;

        // Validation
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

        let receiptPath = null;

        // Handle File Upload
        // Check size > 0 to ensure we don't process empty file inputs that some browsers might send
        if (receiptFile && receiptFile.size > 0) {
            try {
                const bytes = await receiptFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Create unique filename
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                // Sanitize filename to avoid filesystem issues
                const originalName = receiptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filename = uniqueSuffix + '-' + (originalName || 'receipt');

                const uploadDir = join(process.cwd(), 'public', 'uploads', 'receipts');

                // Ensure directory exists
                await mkdir(uploadDir, { recursive: true });

                const filePath = join(uploadDir, filename);
                await writeFile(filePath, buffer);

                receiptPath = `/uploads/receipts/${filename}`;
            } catch (fileError) {
                console.error('File Upload Error:', fileError);
                // If file upload fails, we log it but maybe we shouldn't fail the whole order if it's optional?
                // However, if the user explicitly uploaded it, they expect it to work.
                // Let's return error so they know something went wrong.
                throw new Error('Dosya yüklenirken hata oluştu.');
            }
        }

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                customerName: name || '',
                customerPhone: phone || '',
                address: address || '',
                city: city || '',
                district: district || '',
                totalAmount,
                receiptPath,
                status: 'PENDING',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        // Provide a shorter order number for user reference (last 6 chars of ID)
        const orderNo = order.id.slice(-6).toUpperCase();

        return NextResponse.json({ success: true, orderId: order.id, orderNo });

    } catch (error) {
        console.error('Order Error Details:', error);
        return NextResponse.json({
            error: 'Sipariş oluşturulurken bir hata oluştu',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
