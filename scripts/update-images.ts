import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const updates = [
        { name: 'Ballı Hurma', image: '/products/balli-hurma.png' },
        { name: 'Meşruk', image: '/products/mesruk.png' },
        { name: 'Taze Kutu 600 GR', image: '/products/taze-kutu.png' },
        { name: 'Sukai 1', image: '/products/luks-sukai.png' }, // Ensure this is set
        { name: 'Mebrum Duble', image: '/products/Mebrum.png' }, // Ensure this is set
        { name: 'Sukkari Taze Duble Kutu 3KG', image: '/products/sukkarirutab-kutu.png' }, // Ensure this is set
        { name: 'Sukai Duble', image: '/products/Sukaiduble.png' } // Ensure this is set
    ];

    for (const update of updates) {
        console.log(`Updating ${update.name}...`);
        try {
            await prisma.product.updateMany({
                where: { name: update.name },
                data: { image: update.image }
            });
            console.log(`Updated ${update.name}`);
        } catch (e) {
            console.error(`Failed to update ${update.name}:`, e);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
