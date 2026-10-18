/** Grade da biblioteca: 1 coluna no celular, 2 no tablet, 4 no desktop. */
export const classesGrade = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

export function EsqueletoCartao() {
  return (
    <div className="rounded-card bg-branco shadow-card w-full overflow-hidden">
      <div className="bg-areia aspect-video w-full motion-safe:animate-pulse" />
      <div className="flex flex-col gap-3 p-4">
        <div className="bg-areia h-6 w-20 rounded-full motion-safe:animate-pulse" />
        <div className="bg-areia h-5 w-4/5 rounded motion-safe:animate-pulse" />
        <div className="bg-areia h-4 w-1/2 rounded motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
