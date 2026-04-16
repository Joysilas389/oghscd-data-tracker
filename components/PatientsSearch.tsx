"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function PatientsSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(defaultValue);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="mb-3 d-flex gap-2">
      <input type="text" className="form-control form-control-sm"
        placeholder="Search by name, ID, phone, locality..."
        value={q} onChange={e => setQ(e.target.value)} />
      <button type="submit" className="btn btn-sm text-white px-3"
        style={{ background: "#1a5276" }}>🔍</button>
      {defaultValue && (
        <button type="button" className="btn btn-sm btn-outline-secondary"
          onClick={() => { setQ(""); router.push(pathname); }}>
          Clear
        </button>
      )}
    </form>
  );
}
