import { CenaFeira } from "./cenas";

const falas = [
  { antes: "Moço, quanto tá a ", destaque: "manga", depois: " hoje?" },
  { antes: "Tá três reais o ", destaque: "quilo", depois: "." },
  { antes: "Então me vê ", destaque: "duas", depois: ", por favor." },
];

/**
 * Quadro de vídeo de exemplo com legenda que troca em sincronia com a barra de tempo
 * (só CSS). Com movimento reduzido, a legenda fica parada na primeira fala.
 */
export function QuadroVideoExemplo() {
  return (
    <figure className="rounded-card bg-branco shadow-card relative overflow-hidden">
      <CenaFeira
        titulo="Cena ilustrada: barraca de feira com frutas"
        className="block aspect-video w-full"
      />
      <span
        aria-hidden="true"
        className="bg-branco text-azul-acao absolute top-[42%] left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[0_8px_24px_rgba(30,39,46,.25)] sm:size-[76px]"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <div
        aria-hidden="true"
        className="legenda-palco absolute inset-x-4 bottom-7 h-10 sm:inset-x-6 sm:h-11"
      >
        {falas.map((f, i) => (
          <span key={i} className="legenda-fala" style={{ animationDelay: `${i * 3}s` }}>
            <span className="bg-texto/85 text-branco rounded-[10px] px-3.5 py-2 text-base font-semibold sm:text-[19px]">
              {f.antes}
              <span className="text-dourado">{f.destaque}</span>
              {f.depois}
            </span>
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="bg-texto/30 absolute inset-x-0 bottom-0 h-1.5">
        <span className="legenda-tempo bg-verde block h-full" />
      </div>
      <figcaption className="sr-only">
        Exemplo de legenda: {falas.map((f) => f.antes + f.destaque + f.depois).join(" ")}
      </figcaption>
    </figure>
  );
}
