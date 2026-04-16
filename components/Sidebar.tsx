import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface Props {
  role: string;
  fullName: string;
  facilityName: string;
  active?: string;
}

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/patients", label: "Patients", icon: "👥" },
  { href: "/screenings/new", label: "New Screening", icon: "➕" },
  { href: "/screenings", label: "All Screenings", icon: "📋" },
  { href: "/reports", label: "Reports / Export", icon: "📤" },
  { href: "/profile", label: "My Profile", icon: "👤" },
];

const managerLinks = [
  { href: "/review", label: "Review Queue", icon: "🔍" },
  { href: "/admin/users", label: "User Management", icon: "⚙️" },
];

export default function Sidebar({ role, fullName, facilityName, active }: Props) {
  const allLinks = (role === "MANAGER" || role === "ADMIN")
    ? [...links, ...managerLinks]
    : links;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="d-none d-md-flex flex-column p-3"
        style={{ width: 230, minWidth: 230, background: "#1a5276", minHeight: "100vh", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div className="text-white fw-bold mb-0" style={{ fontSize: "0.9rem" }}>OGH SCD E-Tracker</div>
        <div className="text-white-50 mb-4" style={{ fontSize: "0.65rem" }}>Oda Government Hospital</div>
        <nav className="nav flex-column flex-grow-1">
          {allLinks.map(item => (
            <Link key={item.href} href={item.href}
              className="nav-link d-flex align-items-center gap-2 small rounded mb-1"
              style={{
                color: active === item.href ? "#fff" : "rgba(255,255,255,0.8)",
                padding: "0.5rem 0.75rem",
                background: active === item.href ? "rgba(255,255,255,0.2)" : "transparent",
              }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-3 border-top border-secondary">
          <div className="text-white-50 small text-truncate">{fullName}</div>
          <div className="mb-2" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
            {role} · {facilityName}
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Mobile top bar - NO "+ New" button, just logo and logout */}
      <div className="d-md-none w-100 d-flex align-items-center justify-content-between px-3 py-2"
        style={{ background: "#1a5276", position: "sticky", top: 0, zIndex: 1000 }}>
        <Link href="/dashboard" className="text-white fw-bold text-decoration-none" style={{ fontSize: "0.85rem" }}>
          OGH SCD E-Tracker
        </Link>
        <LogoutButton />
      </div>

      {/* Mobile bottom nav */}
      <div className="d-md-none position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-sm"
        style={{ zIndex: 999 }}>
        <div className="d-flex justify-content-around py-2">
          <Link href="/dashboard" className="text-center text-decoration-none text-muted" style={{ fontSize: "0.6rem" }}>
            <div className="fs-5">📊</div><div>Dashboard</div>
          </Link>
          <Link href="/patients" className="text-center text-decoration-none text-muted" style={{ fontSize: "0.6rem" }}>
            <div className="fs-5">👥</div><div>Patients</div>
          </Link>
          <Link href="/screenings/new" className="text-center text-decoration-none" style={{ fontSize: "0.6rem" }}>
            <div className="fs-4 text-white rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40, background: "#1a5276", marginTop: "-12px" }}>➕</div>
            <div className="text-muted">New</div>
          </Link>
          <Link href="/screenings" className="text-center text-decoration-none text-muted" style={{ fontSize: "0.6rem" }}>
            <div className="fs-5">📋</div><div>Screenings</div>
          </Link>
          <Link href="/reports" className="text-center text-decoration-none text-muted" style={{ fontSize: "0.6rem" }}>
            <div className="fs-5">📤</div><div>Export</div>
          </Link>
        </div>
      </div>
    </>
  );
}
