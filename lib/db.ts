import Prisma from "@prisma/client";

const { PrismaClient } = Prisma;

declare global {
  var prisma: InstanceType<typeof PrismaClient> | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
