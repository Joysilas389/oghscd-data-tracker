"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  actionTypes: string[];
  entityTypes: string[];
}

function AuditFilterInner({ actionTypes, entityTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = useState(searchParams.get("action") || "");
  const [entity, setEntity] = useState(searchParams.get("entity") || "");

  function handleFilter() {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (entity) params.set("entity", entity);
    params.set("page", "1");
    router.push("/admin/audit?" + params.toString());
  }

  function handleClear() {
    setAction("");
    setEntity("");
    router.push("/admin/audit");
  }

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body p-3">
        <div className="row g-2 align-items-end">
          <div className="col-5 col-md-3">
            <label className="form-label small fw-semibold mb-1">Action</label>
            <select className="form-select form-select-sm"
              value={action} onChange={e => setAction(e.target.value)}>
              <option value="">All Actions</option>
              {actionTypes.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="col-5 col-md-3">
            <label className="form-label small fw-semibold mb-1">Entity</label>
            <select className="form-select form-select-sm"
              value={entity} onChange={e => setEntity(e.target.value)}>
              <option value="">All Entities</option>
              {entityTypes.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="col-2 col-md-2 d-flex gap-2">
            <button onClick={handleFilter}
              className="btn btn-sm text-white" style={{ background: "#1a5276" }}>
              Filter
            </button>
            {(action || entity) && (
              <button onClick={handleClear}
                className="btn btn-sm btn-outline-secondary">
                Clear
              </button>
            )}
          </div>
        </div>
        {(action || entity) && (
          <div className="mt-2">
            {action && <span className="badge bg-primary me-1">{action}</span>}
            {entity && <span className="badge bg-secondary me-1">{entity}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditFilter(props: Props) {
  return (
    <Suspense fallback={<div className="card border-0 shadow-sm mb-3 p-3 text-muted small">Loading filters...</div>}>
      <AuditFilterInner {...props} />
    </Suspense>
  );
}
