import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { generateMatchHash } from "@/lib/auth";
import Link from "next/link";

export default async function MigratePage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const { run } = await searchParams;
  let result = "";

  if (run === "1") {
    const patients = await prisma.patient.findMany({
      select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
    });

    let updated = 0;
    for (const p of patients) {
      const newHash = generateMatchHash(
        p.firstName,
        p.lastName,
        p.dateOfBirth.toISOString().slice(0, 10),
        ""
      );
      await prisma.patient.update({
        where: { id: p.id },
        data: { matchHash: newHash },
      });
      updated++;
    }
    result = `✅ Successfully recomputed hashes for ${updated} patients.`;
  }

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h1 className="h4 fw-bold mb-3">🔧 Hash Migration</h1>
      <p className="text-muted small mb-4">
        This recomputes all patient match hashes using name + DOB only
        (removing phone number from duplicate detection).
        Run this once only.
      </p>
      {result && (
        <div className="alert alert-success fw-semibold">{result}</div>
      )}
      {run !== "1" && (
        <Link href="/admin/migrate?run=1"
          className="btn text-white px-4"
          style={{ background: "#1a5276" }}>
          ▶ Run Migration Now
        </Link>
      )}
      {run === "1" && (
        <Link href="/dashboard" className="btn btn-outline-secondary">
          ← Back to Dashboard
        </Link>
      )}
    </div>
  );
}
