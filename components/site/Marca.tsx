import Image from "next/image";
import Link from "next/link";
import { cx } from "@/components/ui";

type Props = { clara?: boolean; className?: string };

/** Logo (balões sobre a mão) + nome em duas linhas. */
export function Marca({ clara = false, className }: Props) {
  return (
    <Link
      href="/"
      className={cx(
        "font-titulo inline-flex min-h-11 items-center gap-2.5 text-[22px] leading-none font-bold",
        clara ? "text-branco" : "text-azul-fundo",
        className,
      )}
    >
      <Image src="/marca/logo.png" alt="" width={48} height={48} priority className="size-12" />
      <span className="flex flex-col">
        <span>Mundo</span>
        <span>Ilusófono</span>
      </span>
      <span className="sr-only">, ir para o início</span>
    </Link>
  );
}
