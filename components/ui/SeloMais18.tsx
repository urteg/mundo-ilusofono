import { cx } from "./cx";

/** Vídeo para maiores de 18 anos. */
export function SeloMais18({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full bg-[#7A1F1F] px-2.5 py-1 text-xs font-extrabold text-white",
        className,
      )}
    >
      +18<span className="sr-only"> (conteúdo para maiores de 18 anos)</span>
    </span>
  );
}
