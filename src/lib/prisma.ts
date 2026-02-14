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

// Keep the default export for local development/scripts
export const prisma = new PrismaClient()
