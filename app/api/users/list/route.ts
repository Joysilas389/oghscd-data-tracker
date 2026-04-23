import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { isActive: true, id: { not: session.userId } },
    select: { id: true, fullName: true, role: true, cadre: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ users });
}
