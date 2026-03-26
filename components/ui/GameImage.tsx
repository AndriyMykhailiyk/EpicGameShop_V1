"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useCallback } from "react";

const PLACEHOLDER_SRC = "/placeholder-game.svg";

/**
 * Checks whether a URL points to an external host.
 * Local paths (starting with `/`) and relative paths are considered internal.
 */
function isExternalUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

type GameImageProps = Omit<ImageProps, "onError"> & {
  fallbackSrc?: string;
};

/**
 * A wrapper around `next/image` tailored for game thumbnails.
 *
 * - External URLs are served with `unoptimized` to bypass the Next.js
 *   image‑optimization proxy, which many game‑asset CDNs block.
 * - On load errors the component falls back to a local placeholder,
 *   preventing broken‑image icons in the UI.
 *
 * @example
 * <GameImage src={game.imageUrl} alt={game.title} width={300} height={170} />
 */
export default function GameImage({
  src,
  fallbackSrc = PLACEHOLDER_SRC,
  ...rest
}: GameImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  }, [hasError, fallbackSrc]);

  const resolvedSrc = typeof imgSrc === "string" ? imgSrc : src;
  const external = typeof resolvedSrc === "string" && isExternalUrl(resolvedSrc);

  return (
    <Image
      {...rest}
      src={imgSrc}
      unoptimized={external}
      onError={handleError}
    />
  );
}
