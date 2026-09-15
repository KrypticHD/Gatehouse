type GatehouseMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * Flat interface version of the Gatehouse "G" mark: a blue-to-lilac gradient ring with the
 * G's inward spur, no bevels or glow. The full sculpted 3D mark (public/brand/gatehouse-mark-3d.png)
 * is reserved for marketing surfaces — see docs/product.md "Visual identity".
 */
export function GatehouseMark({ size = 32, className, title = "Gatehouse" }: GatehouseMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="gatehouse-mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B5A1ED" />
          <stop offset="100%" stopColor="#476CFF" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke="url(#gatehouse-mark-gradient)"
        strokeWidth="18"
        strokeDasharray="161.96 39.1"
        strokeLinecap="round"
      />
      <rect x="52" y="41" width="30" height="18" rx="9" fill="url(#gatehouse-mark-gradient)" />
    </svg>
  );
}
