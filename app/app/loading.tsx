/** Esqueleto enquanto a tela do app carrega. */
export default function Carregando() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="Carregando">
      <div className="bg-areia h-10 w-64 max-w-full rounded-xl" />
      <div className="bg-areia h-5 w-80 max-w-full rounded-lg" />
      <div className="bg-areia h-14 w-full max-w-[560px] rounded-full" />
      <div className="rounded-card bg-areia aspect-video w-full max-w-[760px]" />
      <div className="rounded-card bg-areia h-24 w-full max-w-[760px]" />
    </div>
  );
}
