"use client";

import { Reveal } from "../reveal";

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal>
      <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
        {eyebrow && (
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-h3d-purple">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {sub && <p className="mt-4 text-sm leading-relaxed text-h3d-muted sm:text-base">{sub}</p>}
      </div>
    </Reveal>
  );
}
