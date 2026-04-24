interface Props {
  isMultipleBirth: boolean;
  multipleBirthType?: string | null;
  birthOrder?: number | null;
  size?: "sm" | "md";
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

export default function MultipleBirthBadge({
  isMultipleBirth, multipleBirthType, birthOrder, size = "sm",
}: Props) {
  if (!isMultipleBirth) return null;

  const type = multipleBirthType || "Multiple Birth";
  const order = birthOrder ? `${ordinal(birthOrder)}` : null;
  const label = order ? `👥 ${order} ${type}` : `👥 ${type}`;

  return (
    <span style={{
      display: "inline-block",
      background: "#6f42c1",
      color: "#fff",
      borderRadius: 20,
      fontSize: size === "sm" ? "0.6rem" : "0.75rem",
      fontWeight: 700,
      padding: size === "sm" ? "1px 7px" : "2px 10px",
      letterSpacing: "0.02em",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
    }}>
      {label}
    </span>
  );
}
