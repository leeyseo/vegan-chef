import { useState } from "react";
import { Icon } from "./Icon";

/**
 * 외부 샘플 이미지(디자인 자산)가 로드되지 않으면
 * 브랜드 그린 그라데이션 + 아이콘으로 우아하게 대체한다.
 */
export function ImageWithFallback({
  src,
  alt,
  className = "",
  imgClassName = "",
  icon = "eco",
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  icon?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-secondary-container via-tertiary-fixed to-surface-container-high ${className}`}
        role="img"
        aria-label={alt}
      >
        <Icon name={icon} filled className="text-[40px] text-primary/40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`}
    />
  );
}
