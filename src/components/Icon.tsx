/** Material Symbols Outlined 아이콘 헬퍼. */
export function Icon({
  name,
  filled = false,
  className = "",
  style,
}: {
  name: string;
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined${filled ? " filled" : ""} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
