"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SmartImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
};

/**
 * next/image wrapper that gracefully falls back to a guaranteed asset if the
 * requested file is missing (assets may still be materializing in the sandbox).
 */
export function SmartImage({
  src,
  fallbackSrc = "/images/hero-robot.png",
  className,
  alt,
  ...rest
}: SmartImageProps) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      src={current}
      alt={alt}
      className={cn(className)}
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
      {...rest}
    />
  );
}
