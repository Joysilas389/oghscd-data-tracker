import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  return (
    <div className="container py-4">
      <h1 className="h4 fw-bold mb-4">My Profile</h1>
      <div className="card border-0 shadow-sm" style={{maxWidth:500}}>
        <div className="card-body p-4">
          <p><strong>Name:</strong> {session.fullName}</p>
          <p><strong>Email:</strong> {session.email}</p>
          <p><strong>Role:</strong> {session.role}</p>
          <p><strong>Facility:</strong> {session.facilityName}</p>
          <Link href="/dashboard" className="btn btn-sm btn-outline-secondary">Back</Link>
        </div>
      </div>
    </div>
  );
}
