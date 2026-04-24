import bcrypt from "bcryptjs";
import { prisma } from "./db";


// ── Duplicate Detection Utilities ──────────────────────────────────────────

// Levenshtein distance — measures how many edits needed to transform one string to another
export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// Similarity score 0-1 (1 = identical)
export function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const an = a.toLowerCase().trim().replace(/\s+/g, "");
  const bn = b.toLowerCase().trim().replace(/\s+/g, "");
  if (an === bn) return 1;
  const maxLen = Math.max(an.length, bn.length);
  if (maxLen === 0) return 1;
  return (maxLen - levenshtein(an, bn)) / maxLen;
}

// Soundex — phonetic encoding (catches Kwame/Kwameh, Ama/Amah etc)
export function soundex(name: string): string {
  const s = name.toUpperCase().replace(/[^A-Z]/g, "");
  if (!s) return "";
  const map: Record<string, string> = {
    B:"1",F:"1",P:"1",V:"1",
    C:"2",G:"2",J:"2",K:"2",Q:"2",S:"2",X:"2",Z:"2",
    D:"3",T:"3", L:"4", M:"5",N:"5", R:"6",
  };
  let code = s[0];
  let prev = map[s[0]] || "0";
  for (let i = 1; i < s.length && code.length < 4; i++) {
    const c = map[s[i]] || "0";
    if (c !== "0" && c !== prev) { code += c; }
    prev = c;
  }
  return code.padEnd(4, "0");
}

// Check if two names are phonetically similar
export function phoneticMatch(a: string, b: string): boolean {
  const wordsA = a.toLowerCase().trim().split(/\s+/);
  const wordsB = b.toLowerCase().trim().split(/\s+/);
  return wordsA.some(wa => wordsB.some(wb => soundex(wa) === soundex(wb) && wa.length > 2));
}

// DOB flexibility — check if two dates are within N days of each other
export function dobWithinDays(dob1: string, dob2: string, days: number = 3): boolean {
  const d1 = new Date(dob1).getTime();
  const d2 = new Date(dob2).getTime();
  return Math.abs(d1 - d2) <= days * 24 * 60 * 60 * 1000;
}

// Master duplicate score — returns 0-100
export function duplicateScore(
  fn1: string, ln1: string, dob1: string, phone1: string,
  fn2: string, ln2: string, dob2: string, phone2: string
): number {
  let score = 0;

  // Name similarity (40 points)
  const fnSim = similarity(fn1, fn2);
  const lnSim = similarity(ln1, ln2);
  const nameSim = (fnSim + lnSim) / 2;
  score += nameSim * 40;

  // Phonetic match bonus (10 points)
  const fullName1 = fn1 + " " + ln1;
  const fullName2 = fn2 + " " + ln2;
  if (phoneticMatch(fullName1, fullName2)) score += 10;

  // DOB exact match (35 points) or close match (20 points)
  const dob1n = new Date(dob1).toISOString().slice(0, 10);
  const dob2n = new Date(dob2).toISOString().slice(0, 10);
  if (dob1n === dob2n) {
    score += 35;
  } else if (dobWithinDays(dob1, dob2, 3)) {
    score += 20;
  }

  // Phone match bonus (15 points)
  const p1 = phone1.replace(/\D/g, "").slice(-9);
  const p2 = phone2.replace(/\D/g, "").slice(-9);
  if (p1 && p2 && p1 === p2) score += 15;

  return Math.min(Math.round(score), 100);
}

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
  phone: string = ""
): string {
  const normalized = [
    firstName.toLowerCase().trim().replace(/\s+/g, ""),
    lastName.toLowerCase().trim().replace(/\s+/g, ""),
    dob,
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
