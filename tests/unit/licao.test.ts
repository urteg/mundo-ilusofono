import { describe, expect, it } from "vitest";
import { diaDoDesafio, estaAtivo, podeAssistir, type Entitlement } from "@/lib/entitlements";
import { recomendarVideo, sortearOutro, type VideoLicao } from "@/lib/licao";

const agora = new Date("2026-10-18T12:00:00Z");
const v = (
  id: string,
  nivel: number,
  plano: string,
  ordem: number,
  serie = 1,
  desafio: number | null = null,
): VideoLicao => ({
  id,
  nivel: String(nivel),
  plano_minimo: plano,
  ordem,
  serie_ordem: serie,
  desafio_dia: desafio,
});
const ent = (
  produto: string,
  status = "active",
  extra: Partial<Entitlement> = {},
): Entitlement => ({
  produto,
  status,
  renova_em: null,
  comprado_em: "2026-10-16T09:00:00Z",
  ...extra,
});

const videos = [
  v("n1-s2-a", 1, "entender", 1, 2),
  v("n1-s1-b", 1, "entender", 2, 1),
  v("n1-s1-a", 1, "gratis", 1, 1, 1),
  v("n2-a", 2, "entender", 1, 3, 2),
  v("n2-p", 2, "participar", 2, 3),
  v("n3-g", 3, "gratis", 1, 4),
];

describe("lib/entitlements", () => {
  it("cancelado vale até o fim do período", () => {
    expect(
      estaAtivo(ent("entender", "canceled", { renova_em: "2026-10-20T00:00:00Z" }), agora),
    ).toBe(true);
    expect(
      estaAtivo(ent("entender", "canceled", { renova_em: "2026-10-17T00:00:00Z" }), agora),
    ).toBe(false);
  });

  it("pagamento atrasado mantém o acesso por 3 dias", () => {
    expect(
      estaAtivo(ent("entender", "past_due", { renova_em: "2026-10-16T12:00:00Z" }), agora),
    ).toBe(true);
    expect(
      estaAtivo(ent("entender", "past_due", { renova_em: "2026-10-14T12:00:00Z" }), agora),
    ).toBe(false);
  });

  it("participar abre os vídeos do entender; entender não abre os do participar", () => {
    expect(
      podeAssistir({ plano_minimo: "entender", desafio_dia: null }, [ent("participar")], agora),
    ).toBe(true);
    expect(
      podeAssistir({ plano_minimo: "participar", desafio_dia: null }, [ent("entender")], agora),
    ).toBe(false);
  });

  it("o desafio libera um vídeo por dia desde a compra", () => {
    const d = [ent("desafio", "active", { comprado_em: "2026-10-16T09:00:00Z" })];
    expect(diaDoDesafio(d, agora)).toBe(3);
    expect(podeAssistir({ plano_minimo: "entender", desafio_dia: 3 }, d, agora)).toBe(true);
    expect(podeAssistir({ plano_minimo: "entender", desafio_dia: 4 }, d, agora)).toBe(false);
    expect(podeAssistir({ plano_minimo: "entender", desafio_dia: null }, d, agora)).toBe(false);
  });
});

describe("lib/licao", () => {
  it("primeiro não visto do nível, na ordem da série", () => {
    const r = recomendarVideo({
      videos,
      vistos: new Set(),
      nivelParticipante: 1,
      ents: [ent("entender")],
      agora,
    });
    expect(r?.id).toBe("n1-s1-a");
  });

  it("pula os vistos", () => {
    const r = recomendarVideo({
      videos,
      vistos: new Set(["n1-s1-a"]),
      nivelParticipante: 1,
      ents: [ent("entender")],
      agora,
    });
    expect(r?.id).toBe("n1-s1-b");
  });

  it("nível todo visto: sugere o próximo nível", () => {
    const vistos = new Set(["n1-s1-a", "n1-s1-b", "n1-s2-a"]);
    const r = recomendarVideo({
      videos,
      vistos,
      nivelParticipante: 1,
      ents: [ent("entender")],
      agora,
    });
    expect(r?.id).toBe("n2-a");
  });

  it("respeita o plano: entender não recebe vídeo do participar", () => {
    const vistos = new Set(["n1-s1-a", "n1-s1-b", "n1-s2-a", "n2-a"]);
    const r = recomendarVideo({
      videos,
      vistos,
      nivelParticipante: 2,
      ents: [ent("entender")],
      agora,
    });
    expect(r?.id).toBe("n3-g");
  });

  it("sem plano, só grátis", () => {
    const r = recomendarVideo({
      videos,
      vistos: new Set(["n1-s1-a"]),
      nivelParticipante: 1,
      ents: [],
      agora,
    });
    expect(r?.id).toBe("n3-g");
  });

  it("plano vencido conta como sem plano", () => {
    const vencido = ent("entender", "canceled", { renova_em: "2026-10-01T00:00:00Z" });
    const r = recomendarVideo({
      videos,
      vistos: new Set(),
      nivelParticipante: 2,
      ents: [vencido],
      agora,
    });
    expect(r?.plano_minimo).toBe("gratis");
  });

  it("tudo visto: rever, nunca vazio se houver elegível", () => {
    const vistos = new Set(videos.map((x) => x.id));
    const r = recomendarVideo({
      videos,
      vistos,
      nivelParticipante: 1,
      ents: [ent("participar")],
      agora,
    });
    expect(r?.id).toBe("n1-s1-a");
  });

  it("nada elegível devolve null", () => {
    const pagos = videos.filter((x) => x.plano_minimo !== "gratis");
    expect(
      recomendarVideo({ videos: pagos, vistos: new Set(), nivelParticipante: 1, ents: [], agora }),
    ).toBeNull();
  });

  it("escolher outro: nunca repete o atual e prefere não vistos", () => {
    const entrada = { videos, vistos: new Set(["n1-s1-b"]), ents: [ent("entender")], agora };
    for (const sorte of [0, 0.3, 0.6, 0.99]) {
      const o = sortearOutro(entrada, "n1-s1-a", () => sorte);
      expect(o?.id).not.toBe("n1-s1-a");
      expect(o?.id).not.toBe("n1-s1-b");
      expect(o?.plano_minimo).not.toBe("participar");
    }
  });

  it("escolher outro sem alternativa devolve null", () => {
    const so = [v("unico", 1, "gratis", 1)];
    expect(sortearOutro({ videos: so, vistos: new Set(), ents: [], agora }, "unico")).toBeNull();
  });
});
