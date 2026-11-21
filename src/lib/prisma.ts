import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// Define the Cloudflare D1Database type if it's not globally available
declare global {
  interface D1Database { }
}

export const createPrismaClient = (db?: any) => {
  if (db) {
    const adapter = new PrismaD1(db)
    // @ts-ignore - adapter is valid with previewFeatures = ["driverAdapters"]
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

// Not: modül düzeyinde `new PrismaClient()` oluşturulmaz; edge ortamında sürücü
// bağdaştırıcısı olmadan istemci kurulamaz ve bu dosyayı içe aktaran tüm rotalar
// derlemede çöker. Her istek createPrismaClient(env.DB) kullanır.
