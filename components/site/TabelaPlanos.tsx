import { Icone } from "@/components/ui";

// Tabela "Compare os planos", usada no site (/planos) e no app (/app/planos).

type Celula = true | false | string;
const colunas = ["Grátis", "Entender", "Participar"] as const;
const linhas: [string, Celula, Celula, Celula][] = [
  ["Vídeos do nível inicial", true, true, true],
  ["Biblioteca completa", false, true, true],
  ["Séries", false, true, true],
  ["Progresso", true, true, true],
  ["Vocabulário do vídeo", "Só nos vídeos grátis", true, true],
  ["Gravações das lives", false, true, true],
  ["Lives ao vivo", false, false, true],
  ["Conversa em grupo", false, false, true],
];

function ValorCelula({ valor }: { valor: Celula }) {
  if (typeof valor === "string") return <span className="text-sm">{valor}</span>;
  return valor ? (
    <Icone nome="check" rotulo="Sim" className="mx-auto text-[#00684F]" />
  ) : (
    <Icone nome="fechar" rotulo="Não" tamanho={20} className="text-texto-suave mx-auto" />
  );
}

export function TabelaPlanos() {
  return (
    <>
      <div
        className="rounded-card bg-branco shadow-card overflow-x-auto"
        role="region"
        aria-labelledby="legenda-comparacao"
        tabIndex={0}
      >
        <table className="w-full min-w-[560px] border-collapse">
          <caption id="legenda-comparacao" className="sr-only">
            O que cada plano inclui
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="bg-branco font-titulo text-azul-fundo sticky left-0 z-10 px-4 py-4 text-left text-lg font-semibold"
              >
                O que você recebe
              </th>
              {colunas.map((c) => (
                <th
                  key={c}
                  scope="col"
                  className="font-titulo text-azul-fundo px-4 py-4 text-center text-lg font-semibold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map(([nome, ...valores]) => (
              <tr key={nome} className="border-areia border-t">
                <th
                  scope="row"
                  className="bg-branco sticky left-0 z-10 max-w-[45vw] px-4 py-3.5 text-left font-semibold"
                >
                  {nome}
                </th>
                {valores.map((v, i) => (
                  <td key={colunas[i]} className="px-4 py-3.5 text-center">
                    <ValorCelula valor={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-texto-suave text-sm sm:hidden">
        Arraste a tabela para o lado para ver todos os planos.
      </p>
    </>
  );
}
