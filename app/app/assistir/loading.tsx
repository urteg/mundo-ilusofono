import { EsqueletoCartao, classesGrade } from "@/components/app/Esqueletos";

export default function Carregando() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando vídeos">
      <div className="bg-areia h-12 w-72 max-w-full rounded-xl motion-safe:animate-pulse" />
      <div className="bg-areia h-12 w-full rounded-full motion-safe:animate-pulse" />
      <ul className={classesGrade}>
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i}>
            <EsqueletoCartao />
          </li>
        ))}
      </ul>
    </div>
  );
}
