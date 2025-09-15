
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function withSslParam(url?: string) {
  if (!url) return url;
  if (process.env.NODE_ENV !== "production") return url;
  if (/sslmode=/i.test(url)) return url;
  return url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

const datasourceUrl = withSslParam(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
    datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
