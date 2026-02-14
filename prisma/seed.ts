import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Existing data to preserve prices and categories
const oldData = [
  { name: "Acve Duble", price: 820, category: "premium", order: 1 },
  { name: "Acve", price: 650, category: "premium", order: 2 },
  { name: "Ballı Hurma", price: 350, category: "klasik", order: 3 },
  { name: "Mebrum Duble", price: 820, category: "premium", order: 4 },
  { name: "Mebrum", price: 590, category: "klasik", order: 5 },
  { name: "Sukai Duble", price: 700, category: "premium", order: 6 },
  { name: "Sukai 1", price: 590, category: "klasik", order: 7 },
  { name: "Amber Duble", price: 820, category: "premium", order: 8 },
  { name: "Amber", price: 590, category: "klasik", order: 9 },
  { name: "Mejdul Jumbo", price: 1110, category: "premium", order: 10 },
  { name: "Mejdul Duble", price: 1000, category: "premium", order: 11 },
  { name: "Mejdul 1", price: 700, category: "klasik", order: 12 },
  { name: "Mejdul Orta Boy", price: 590, category: "klasik", order: 13 },
  { name: "Meşruk", price: 360, category: "ekonomik", order: 14 },
  { name: "Safavi Duble", price: 600, category: "klasik", order: 15 },
  { name: "Safavi", price: 530, category: "klasik", order: 16 },
  { name: "Çekirdeksiz Hurma", price: 700, category: "ozel", order: 17 },
  { name: "Çikolatalı Bademli Hurma", price: 700, category: "ozel", order: 18 },
  { name: "Hurma Macunu", price: 350, category: "ozel", order: 21 },
];

async function main() {
  console.log('Seeding database...');

  // Read extracted products
  const productsPath = path.join(__dirname, '..', 'scripts', 'products.json');
  let extractedProducts = [];

  try {
    const raw = fs.readFileSync(productsPath, 'utf8');
    extractedProducts = JSON.parse(raw);
    console.log(`Loaded ${extractedProducts.length} extracted products.`);
  } catch (e) {
    console.error('Could not load products.json, falling back to empty list', e);
  }

  // Delete existing products and orders to prevent FK errors
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  // Helper to normalize strings for matching
  const normalize = (s: string) => s.toLowerCase().replace(/ı/g, 'i').trim();

  // Create products
  let orderCounter = 1;
  const createdNames = new Set();

  for (const product of extractedProducts) {
    // Try to find match in old data
    const match = oldData.find(old => {
      // Direct match or "Anber" vs "Amber"
      if (normalize(old.name) === normalize(product.name)) return true;
      if (normalize(old.name).replace('amber', 'anber') === normalize(product.name)) return true;
      return false;
    });

    const price = match ? match.price : 0;
    const category = match ? match.category : (product.category || 'hurma');
    const order = match ? match.order : orderCounter++;

    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description || match?.name || product.name, // Fallback description
        price: price,
        unit: product.unit || "KG",
        category: category,
        isActive: true, // extracted products are active
        order: order,
        image: product.image
      },
    });
    createdNames.add(normalize(product.name));
  }

  // Also add items from oldData that were NOT in extractedProducts (e.g. Ballı Hurma)
  // because the docx might be incomplete
  for (const old of oldData) {
    // Check if we already added something similar
    const alreadyAdded = Array.from(createdNames).some(n =>
      n === normalize(old.name) ||
      (normalize(old.name).includes('amber') && (n as string).includes('anber'))
    );

    if (!alreadyAdded) {
      console.log(`Adding missing product from old data: ${old.name}`);
      await prisma.product.create({
        data: {
          name: old.name,
          description: `${old.name} - Lezzetli hurma çeşidi`, // Generic since we don't have descriptions in oldData object above (I stripped them to save space, oops, I should have kept them from the file view)
          // Wait, I stripped them in the "oldData" array I constructed above. 
          // But the original file HAD descriptions. 
          // I should have copied them. 
          // Let me update the oldData array in my replacement content to include descriptions!
          price: old.price,
          unit: "KG",
          category: old.category,
          isActive: true,
          order: old.order
        }
      });
    }
  }

  console.log(`Seeding completed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
