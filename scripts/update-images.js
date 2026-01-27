const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const updates = [
        { name: 'Ballı Hurma', image: '/products/balli-hurma.png' },
        { name: 'Meşruk', image: '/products/mesruk.png' },
        { name: 'Taze Kutu 600 GR', image: '/products/taze-kutu.png' },
        { name: 'Sukai 1', image: '/products/luks-sukai.png' },
        { name: 'Mebrum Duble', image: '/products/Mebrum.png' },
        { name: 'Sukkari Taze Duble Kutu 3KG', image: '/products/sukkarirutab-kutu.png' },
        { name: 'Sukai Duble', image: '/products/Sukaiduble.png' }
    ];

    for (const update of updates) {
        console.log(`Updating ${update.name}...`);
        try {
            // First check if product exists
            const product = await prisma.product.findFirst({
                where: { name: update.name }
            });

            if (product) {
                await prisma.product.updateMany({
                    where: { name: update.name },
                    data: { image: update.image }
                });
                console.log(`Updated ${update.name}`);
            } else {
                console.log(`Product ${update.name} not found, skipping.`);
            }
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
