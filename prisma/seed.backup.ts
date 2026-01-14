import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialProducts = [
  { name: "Acve Duble", description: "Büyük boy ve en popüler hurma çeşitlerinden biri olan bu hurma, sağlıklı lif, vitamin ve mineral açısından zengindir.", price: 820, unit: "KG", category: "premium", order: 1 },
  { name: "Acve", description: "En popüler hurma çeşitlerinden biri olan Acve, sağlıklı lif, vitamin ve mineral açısından zengindir.", price: 650, unit: "KG", category: "premium", order: 2 },
  { name: "Ballı Hurma", description: "Doğal bal tadında, yumuşak dokulu özel hurma çeşidi.", price: 350, unit: "KG", category: "klasik", order: 3 },
  { name: "Mebrum Duble", description: "Bu eşsiz, uzun ve ince hurmalar çok hafif tatlı bir lezzet ve çiğnenebilir bir dokuya sahiptir.", price: 820, unit: "KG", category: "premium", order: 4 },
  { name: "Mebrum", description: "Bu eşsiz, uzun ve ince hurmalar çok hafif tatlı bir lezzet ve çiğnenebilir bir dokuya sahiptir.", price: 590, unit: "KG", category: "klasik", order: 5 },
  { name: "Sukai Duble", description: "Premium kalite Sukai hurması, büyük boy. Zengin lezzeti ve yumuşak dokusuyla öne çıkar.", price: 700, unit: "KG", category: "premium", order: 6 },
  { name: "Sukai 1", description: "Birinci sınıf Sukai hurması. Tatlı ve besleyici, günlük tüketim için ideal.", price: 590, unit: "KG", category: "klasik", order: 7 },
  { name: "Amber Duble", description: "Büyük boy Amber hurması. Altın renkli, yumuşak ve lezzetli.", price: 820, unit: "KG", category: "premium", order: 8 },
  { name: "Amber", description: "Altın renkli görünümüyle dikkat çeken Amber hurması, yumuşak dokusu ve dengeli tatlılığıyla sevilir.", price: 590, unit: "KG", category: "klasik", order: 9 },
  { name: "Mejdul Jumbo", description: "Son derece yumuşak, tatlı ve zengin kehribar kırmızısı rengiyle bu hurmalar çok beğenilen türdendir.", price: 1110, unit: "KG", category: "premium", order: 10 },
  { name: "Mejdul Duble", description: "Son derece yumuşak, tatlı ve zengin kehribar kırmızısı rengiyle bu hurmalar çok beğenilen türdendir.", price: 1000, unit: "KG", category: "premium", order: 11 },
  { name: "Mejdul 1", description: "Birinci sınıf Mejdul hurması. Yumuşak, tatlı ve kehribar kırmızısı renkte.", price: 700, unit: "KG", category: "klasik", order: 12 },
  { name: "Mejdul Orta Boy", description: "Son derece yumuşak, tatlı ve zengin kehribar kırmızısı rengiyle Mejdul hurması.", price: 590, unit: "KG", category: "klasik", order: 13 },
  { name: "Meşruk", description: "Geleneksel Medine hurması. Hafif tatlı, besleyici ve uygun fiyatlı.", price: 360, unit: "KG", category: "ekonomik", order: 14 },
  { name: "Safavi Duble", description: "Büyük boy Safavi hurması. Koyu renkli, yumuşak ve zengin aromaya sahip.", price: 600, unit: "KG", category: "klasik", order: 15 },
  { name: "Safavi", description: "Koyu renkli, yumuşak ve zengin aromaya sahip İran kökenli hurma çeşidi.", price: 530, unit: "KG", category: "klasik", order: 16 },
  { name: "Çekirdeksiz Hurma", description: "Pratik tüketim için çekirdeksiz hurma. Tatlı yapımı ve atıştırmalık olarak ideal.", price: 700, unit: "KG", category: "ozel", order: 17 },
  { name: "Çikolatalı Bademli Hurma", description: "İçi badem dolgulu, dışı çikolata kaplı premium hurma.", price: 700, unit: "KG", category: "ozel", order: 18 },
  { name: "Sukkari Mufettel Kutu 3KG", description: "Premium Sukkari hurması, 3 kiloluk özel kutuda. Hediye için ideal.", price: 1170, unit: "PAKET", category: "kutu", order: 19 },
  { name: "Sukkari Taze Duble Kutu 3KG", description: "Taze Sukkari hurması, büyük boy, 3 kiloluk kutuda.", price: 1170, unit: "PAKET", category: "kutu", order: 20 },
  { name: "Hurma Macunu", description: "Saf hurma özütünden yapılmış doğal macun. Kahvaltılarda ve tatlılarda kullanılabilir.", price: 350, unit: "KG", category: "ozel", order: 21 },
  { name: "Taze Kutu 600 GR", description: "Taze hurma, 600 gramlık ekonomik paket. Günlük tüketim için ideal boyut.", price: 170, unit: "ADET", category: "kutu", order: 22 },
];

async function main() {
  console.log('Seeding database...');

  // Delete existing products
  await prisma.product.deleteMany();

  // Create products
  for (const product of initialProducts) {
    await prisma.product.create({
      data: {
        ...product,
        isActive: true,
      },
    });
  }

  console.log(`Created ${initialProducts.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
