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

        console.log('Order POST Request Received');
        console.log('Customer:', { name, phone, city, district, address });
        console.log('Total Amount:', totalAmount);
        console.log('Items count:', items?.length);

        let receiptPath = null;

        // Handle File Upload
        if (receiptFile && receiptFile.size > 0) {
            try {
                console.log('Processing receipt file:', receiptFile.name, receiptFile.size);
                const bytes = await receiptFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const originalName = receiptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filename = uniqueSuffix + '-' + (originalName || 'receipt');

                const uploadDir = join(process.cwd(), 'public', 'uploads', 'receipts');
                await mkdir(uploadDir, { recursive: true });

                const filePath = join(uploadDir, filename);
                await writeFile(filePath, buffer);

                receiptPath = `/uploads/receipts/${filename}`;
                console.log('File saved to:', receiptPath);
            } catch (fileError) {
                console.error('Detailed File Upload Error:', fileError);
                throw new Error('Dosya yüklenirken hata oluştu: ' + (fileError instanceof Error ? fileError.message : String(fileError)));
            }
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

            console.log('Order created successfully:', order.id);
            const orderNo = order.id.slice(-6).toUpperCase();
            return NextResponse.json({ success: true, orderId: order.id, orderNo });

        } catch (prismaError) {
            console.error('Detailed Prisma Error:', prismaError);
            throw prismaError;
        }

    } catch (error) {
        console.error('Order Error Details:', error);
        return NextResponse.json({
            error: 'Sipariş oluşturulurken bir hata oluştu',
            details: error instanceof Error ? error.message : String(error),
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        }, { status: 500 });
    }
}
