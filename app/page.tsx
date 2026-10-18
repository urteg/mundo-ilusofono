import Link from "next/link";

export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-azul-fundo text-4xl sm:text-5xl">Mundo Ilusófono</h1>
      <p className="font-mao text-coral-texto text-3xl">O português se vive, não só se estuda.</p>
      <p className="text-texto-suave">Site em construção. A página inicial chega na fase 1.</p>
      <Link
        href="/_ui"
        className="bg-azul-acao text-branco inline-flex min-h-11 w-fit items-center rounded-full px-6 font-semibold"
      >
        Ver componentes
      </Link>
    </main>
  );
}
