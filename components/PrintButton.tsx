"use client";
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "#1a5276", color: "#fff", border: "none",
        padding: "8px 16px", borderRadius: 6, cursor: "pointer",
        fontSize: "0.9rem"
      }}>
      🖨️ Print / Save as PDF
    </button>
  );
}
