"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Props {
  actionTypes: string[];
  entityTypes: string[];
  currentAction: string;
  currentEntity: string;
}

export default function AuditFilter({ actionTypes, entityTypes, currentAction, currentEntity }: Props) {
  const router = useRouter();
  const [action, setAction] = useState(currentAction);
  const [entity, setEntity] = useState(currentEntity);

  useEffect(() => {
    setAction(currentAction);
    setEntity(currentEntity);
  }, [currentAction, currentEntity]);

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
        <div className="row g-2">
          <div className="col-12 col-sm-4">
            <label className="form-label small fw-semibold mb-1">Action</label>
            <select className="form-select form-select-sm w-100"
              value={action} onChange={e => setAction(e.target.value)}>
              <option value="">All Actions</option>
              {actionTypes.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-4">
            <label className="form-label small fw-semibold mb-1">Entity</label>
            <select className="form-select form-select-sm w-100"
              value={entity} onChange={e => setEntity(e.target.value)}>
              <option value="">All Entities</option>
              {entityTypes.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-4 d-flex align-items-end gap-2">
            <button onClick={handleFilter}
              className="btn btn-sm text-white flex-grow-1"
              style={{ background: "#1a5276" }}>
              Filter
            </button>
            <button onClick={handleClear}
              className="btn btn-sm btn-outline-secondary flex-grow-1">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
