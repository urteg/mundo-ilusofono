export default function Carregando() {
  const bloco = "bg-areia rounded-card motion-safe:animate-pulse";
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando o progresso">
      <div className="bg-areia h-12 w-56 rounded-xl motion-safe:animate-pulse" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${bloco} h-44`} />
        <div className={`${bloco} h-44`} />
      </div>
      <div className={`${bloco} h-32`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className={`${bloco} h-96`} />
        <div className={`${bloco} h-96`} />
      </div>
    </div>
  );
}
