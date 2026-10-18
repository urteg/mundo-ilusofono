"use client";

import { useState } from "react";
import { Botao, Chip, Dialogo } from "@/components/ui";

const filtros = ["Nível 1", "Nível 2", "Brasil", "Cozinha", "Ocultar vistos"];

export function ChipsDemo() {
  const [ativos, setAtivos] = useState<string[]>(["Nível 1"]);
  return (
    <div className="flex flex-wrap gap-2">
      {filtros.map((f) => (
        <Chip
          key={f}
          ativo={ativos.includes(f)}
          onClick={() => setAtivos((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]))}
        >
          {f}
        </Chip>
      ))}
    </div>
  );
}

export function DialogoDemo() {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Botao variante="secundario" onClick={() => setAberto(true)}>
        Abrir diálogo
      </Botao>
      <Dialogo
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo="Adicionar tempo fora do app"
        rodape={
          <>
            <Botao variante="discreto" onClick={() => setAberto(false)}>
              Cancelar
            </Botao>
            <Botao onClick={() => setAberto(false)}>Salvar</Botao>
          </>
        }
      >
        <p className="text-texto-suave">
          Conte o tempo que você passou assistindo, ouvindo ou conversando em português fora do app.
        </p>
      </Dialogo>
    </>
  );
}
