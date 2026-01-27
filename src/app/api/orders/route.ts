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
        const totalAmount = parseFloat(formData.get('totalAmount') as string);
        const itemsJson = formData.get('items') as string;
        const receiptFile = formData.get('receipt') as File | null;

        const items = JSON.parse(itemsJson);

        let receiptPath = null;

        // Handle File Upload
        if (receiptFile) {
            const bytes = await receiptFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = uniqueSuffix + '-' + receiptFile.name.replace(/\s/g, '-');

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'receipts');

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true });

            const filePath = join(uploadDir, filename);
            await writeFile(filePath, buffer);

            receiptPath = `/uploads/receipts/${filename}`;
        }

        // Create Order in DB
        const order = await prisma.order.create({
            data: {
                customerName: name,
                customerPhone: phone,
                address,
                city,
                district,
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
        console.error('Order Error:', error);
        return NextResponse.json({ error: 'Sipariş oluşturulurken bir hata oluştu' }, { status: 500 });
    }
}
