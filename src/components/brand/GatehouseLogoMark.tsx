import Image from "next/image";

const LOGO_SRC = "/brand/gatehouse-mark-3d.png";

/**
 * The approved supplied blue-to-lilac 3D "G" mark. Used verbatim (not redrawn) anywhere the
 * brand board requires the real mark: the header, the Explore hero, and the Gatehouse
 * platform community card. See docs/product.md "Visual identity".
 */
export function GatehouseLogoMark({
  size = 32,
  className,
  priority = false,
  fill = false,
}: {
  /** Fixed pixel box (used for the header/hero, where the mark isn't inside a responsive container). */
  size?: number;
  className?: string;
  priority?: boolean;
  /** Use next/image's `fill` mode instead, for embedding inside a responsively-sized parent
   * (e.g. the community-card avatar, which changes size at `sm`). The parent must be
   * `position: relative`. */
  fill?: boolean;
}) {
  if (fill) {
    return (
      <Image
        src={LOGO_SRC}
        alt="Gatehouse"
        fill
        sizes="56px"
        priority={priority}
        className={className}
        style={{ objectFit: "contain" }}
      />
    );
  }

  return (
    <Image
      src={LOGO_SRC}
      alt="Gatehouse"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
