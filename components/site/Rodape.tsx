import Link from "next/link";
import { rodape, site } from "@/lib/site";

export function Rodape() {
  return (
    <footer className="bg-azul-fundo text-[#D7E6F2]">
      <div className="mx-auto flex max-w-[1260px] flex-wrap justify-between gap-10 px-4 pt-12 pb-8 sm:px-8">
        <div className="flex max-w-sm flex-[1_1_280px] flex-col gap-3">
          <span className="font-titulo text-branco text-2xl font-semibold">{site.nome}</span>
          <p className="text-[15px]">{site.descricao}</p>
        </div>
        <div className="grid flex-[2_1_480px] grid-cols-1 gap-8 min-[480px]:grid-cols-3">
          {rodape.map((coluna) => (
            <nav key={coluna.titulo} aria-label={coluna.titulo}>
              <h2 className="font-titulo text-branco mb-2 text-base font-semibold">
                {coluna.titulo}
              </h2>
              <ul className="flex flex-col">
                {coluna.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-branco inline-flex min-h-11 items-center text-[15px] text-[#D7E6F2] hover:underline"
                    >
                      {link.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/15 px-4 py-6 sm:px-8">
        <span className="text-sm text-[#C3D7E8]">Os preços não incluem imposto.</span>
        <span className="font-mao text-dourado text-[26px]">{site.lema}</span>
      </div>
    </footer>
  );
}
