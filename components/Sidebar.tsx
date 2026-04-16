"use client";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface Props {
  role: string;
  fullName: string;
  facilityName: string;
  active: string;
}

const baseLinks = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/screenings", label: "Records", icon: "📋" },
  { href: "/screenings/new", label: "New Screening", icon: "➕", highlight: true },
  { href: "/patients", label: "Patients", icon: "👥" },
  { href: "/reports", label: "Reports", icon: "📁" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const managerLinks = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/screenings", label: "Records", icon: "📋" },
  { href: "/screenings/new", label: "New Screening", icon: "➕", highlight: true },
  { href: "/patients", label: "Patients", icon: "👥" },
  { href: "/review", label: "Review Queue", icon: "🔍" },
  { href: "/reports", label: "Reports", icon: "📁" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/admin/users", label: "User Management", icon: "⚙️" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const adminLinks = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/screenings", label: "Records", icon: "📋" },
  { href: "/screenings/new", label: "New Screening", icon: "➕", highlight: true },
  { href: "/patients", label: "Patients", icon: "👥" },
  { href: "/review", label: "Review Queue", icon: "🔍" },
  { href: "/reports", label: "Reports", icon: "📁" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/admin/users", label: "User Management", icon: "⚙️" },
  { href: "/admin/audit", label: "Audit Log", icon: "📜" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const mobileScreenerLinks = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/screenings", label: "Records", icon: "📋" },
  { href: "/screenings/new", label: "New", icon: "➕", highlight: true },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const mobileManagerLinks = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/screenings/new", label: "New", icon: "➕", highlight: true },
  { href: "/review", label: "Review", icon: "🔍" },
  { href: "/admin/users", label: "Users", icon: "⚙️" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

const mobileAdminLinks = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/screenings/new", label: "New", icon: "➕", highlight: true },
  { href: "/admin/users", label: "Users", icon: "⚙️" },
  { href: "/admin/audit", label: "Audit", icon: "📜" },
  { href: "/help", label: "Help", icon: "❓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Sidebar({ role, fullName, facilityName, active }: Props) {
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER" || role === "ADMIN";

  const allLinks = isAdmin ? adminLinks : isManager ? managerLinks : baseLinks;
  const mobileLinks = isAdmin ? mobileAdminLinks : isManager ? mobileManagerLinks : mobileScreenerLinks;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="d-none d-md-flex flex-column p-3"
        style={{
          width: 230, minWidth: 230, background: "#1a5276",
          minHeight: "100vh", position: "sticky", top: 0,
          height: "100vh", overflowY: "auto",
        }}>
        <div className="text-white fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
          OGH SCD E-Tracker
        </div>
        <div className="text-white-50 mb-4" style={{ fontSize: "0.65rem" }}>
          Oda Government Hospital
        </div>
        <nav className="nav flex-column flex-grow-1">
          {allLinks.map(item => (
            <Link key={item.href} href={item.href}
              className="nav-link d-flex align-items-center gap-2 small rounded mb-1"
              style={{
                color: active === item.href ? "#fff" : "rgba(255,255,255,0.8)",
                padding: "0.5rem 0.75rem",
                background: active === item.href ? "rgba(255,255,255,0.2)" : "transparent",
                fontWeight: item.highlight ? "bold" : "normal",
              }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
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

      {/* Mobile top bar */}
      <div className="d-md-none d-flex align-items-center justify-content-between px-3"
        style={{
          background: "#1a5276", color: "#fff",
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          height: 72, minHeight: 72,
        }}>
        <div>
          <div className="fw-bold" style={{ fontSize: "0.85rem" }}>OGH SCD E-Tracker</div>
          <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>Oda Government Hospital</div>
        </div>
        <div className="text-end d-flex flex-column align-items-end gap-1">
          <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>{fullName}</div>
          <div style={{ fontSize: "0.6rem", opacity: 0.6 }}>{role}</div>
          <LogoutButton />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="d-md-none d-flex justify-content-around align-items-center"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#1a5276", zIndex: 1000,
          height: 60, borderTop: "1px solid rgba(255,255,255,0.15)",
        }}>
        {mobileLinks.map(item => (
          <Link key={item.href} href={item.href}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              color: active === item.href ? "#fff" : "rgba(255,255,255,0.6)",
              textDecoration: "none", flex: 1, height: "100%",
              background: item.highlight && active !== item.href
                ? "rgba(255,255,255,0.1)" : "transparent",
            }}>
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.55rem", marginTop: 1 }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
