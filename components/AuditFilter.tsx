"use client";

interface Props {
  actionTypes: string[];
  entityTypes: string[];
  selectedAction: string;
  selectedEntity: string;
  selectedAction: string;
  selectedEntity: string;
}

export default function AuditFilter({ actionTypes, entityTypes, selectedAction, selectedEntity }: Props) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body p-3">
        <form action="/admin/audit" method="GET">
          <div className="row g-2">
            <div className="col-12 col-sm-5">
              <label className="form-label small fw-semibold mb-1">Action Type</label>
              <select name="action" className="form-select form-select-sm"
                defaultValue={selectedAction}>
                <option value="">All Actions</option>
                {actionTypes.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-5">
              <label className="form-label small fw-semibold mb-1">Entity Type</label>
              <select name="entity" className="form-select form-select-sm"
                defaultValue={selectedEntity}>
                <option value="">All Entities</option>
                {entityTypes.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-2 d-flex align-items-end gap-2">
              <button type="submit"
                className="btn btn-sm text-white flex-grow-1"
                style={{ background: "#1a5276" }}>
                Filter
              </button>
              {(selectedAction || selectedEntity) && (
                <a href="/admin/audit"
                  className="btn btn-sm btn-outline-secondary flex-grow-1">
                  Clear
                </a>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
