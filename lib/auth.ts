import bcrypt from "bcryptjs";
import { prisma } from "./db";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generatePatientCode(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(6, "0");
  return `OGH-SCD-${year}-${padded}`;
}

export function generateMatchHash(
  firstName: string,
  lastName: string,
  dob: string,
  phone: string
): string {
  const normalized = [
    firstName.toLowerCase().trim().replace(/\s+/g, ""),
    lastName.toLowerCase().trim().replace(/\s+/g, ""),
    dob,
    phone.replace(/\D/g, "").slice(-9),
  ].join("|");
  return Buffer.from(normalized).toString("base64");
}

export async function createAuditLog(data: {
  actorId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  beforeJson?: object;
  afterJson?: object;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({ data });
}
