"use client";

import { ReactNode, useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  fallback: ReactNode;
};

export default function CategoryImage({ src, alt, fallback }: Props) {
  const [errored, setErrored] = useState(false);

  const isValidSrc = src && src.trim() !== "" && src.trim().toLowerCase() !== "null";

  if (!isValidSrc || errored) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}