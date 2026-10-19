import { describe, expect, it } from "vitest";
import {
  diaDoDesafio,
  estaAtivo,
  motivoBloqueio,
  podeAssistir,
  pagamentoAtrasado,
  produtosAtivos,
  type Entitlement,
} from "@/lib/entitlements";

const agora = new Date("2026-10-18T12:00:00Z");
const ent = (
  produto: string,
  status = "active",
  extra: Partial<Entitlement> = {},
): Entitlement => ({
  produto,
  status,
  renova_em: null,
  comprado_em: "2026-10-01T10:00:00Z",
  ...extra,
});
const gratis = { plano_minimo: "gratis", desafio_dia: null };
const entender = { plano_minimo: "entender", desafio_dia: null };
const participar = { plano_minimo: "participar", desafio_dia: null };
const doDesafio = (dia: number) => ({ plano_minimo: "entender", desafio_dia: dia });

describe("estaAtivo", () => {
  it("active e trialing valem", () => {
    expect(estaAtivo(ent("entender"), agora)).toBe(true);
    expect(estaAtivo(ent("entender", "trialing"), agora)).toBe(true);
  });
  it("status desconhecidos não valem", () => {
    expect(estaAtivo(ent("entender", "incomplete"), agora)).toBe(false);
    expect(estaAtivo(ent("entender", "unpaid"), agora)).toBe(false);
  });
  it("canceled vale até renova_em e cai logo depois", () => {
    const fim = "2026-10-18T12:00:00Z";
    expect(
      estaAtivo(ent("entender", "canceled", { renova_em: fim }), new Date("2026-10-18T11:59:59Z")),
    ).toBe(true);
    expect(
      estaAtivo(ent("entender", "canceled", { renova_em: fim }), new Date("2026-10-18T12:00:00Z")),
    ).toBe(false);
  });
  it("canceled sem data não vale", () => {
    expect(estaAtivo(ent("entender", "canceled"), agora)).toBe(false);
  });
  it("past_due: 3 dias de tolerância depois do vencimento", () => {
    const venc = "2026-10-15T12:00:00Z";
    expect(
      estaAtivo(ent("entender", "past_due", { renova_em: venc }), new Date("2026-10-18T12:00:00Z")),
    ).toBe(true);
    expect(
      estaAtivo(ent("entender", "past_due", { renova_em: venc }), new Date("2026-10-18T12:00:01Z")),
    ).toBe(false);
  });
  it("past_due sem data de vencimento mantém o acesso", () => {
    expect(estaAtivo(ent("entender", "past_due"), agora)).toBe(true);
  });
});

describe("past_due a partir da primeira falha (webhook)", () => {
  const falhou = "2026-10-15T12:00:00Z";
  const pd = ent("entender", "past_due", {
    renova_em: "2026-11-15T12:00:00Z", // o Stripe já avançou o período
    pagamento_falhou_em: falhou,
  });
  it("vale nos 3 dias depois da falha, mesmo com o período avançado", () => {
    expect(estaAtivo(pd, new Date("2026-10-18T12:00:00Z"))).toBe(true);
    expect(estaAtivo(pd, new Date("2026-10-18T12:00:01Z"))).toBe(false);
  });
  it("aviso discreto só enquanto ainda tem acesso", () => {
    expect(pagamentoAtrasado([pd], new Date("2026-10-16T00:00:00Z"))).toBe(true);
    expect(pagamentoAtrasado([pd], new Date("2026-10-20T00:00:00Z"))).toBe(false);
    expect(pagamentoAtrasado([ent("entender")], agora)).toBe(false);
  });
  it("depois de 3 dias, vídeos pagos fecham; grátis continuam", () => {
    const depois = new Date("2026-10-19T00:00:00Z");
    expect(podeAssistir(entender, [pd], depois)).toBe(false);
    expect(podeAssistir(gratis, [pd], depois)).toBe(true);
  });
  it("cancelado no fim do período: acesso até renova_em", () => {
    const c = ent("participar", "canceled", { renova_em: "2026-10-31T00:00:00Z" });
    expect(podeAssistir(participar, [c], agora)).toBe(true);
    expect(podeAssistir(participar, [c], new Date("2026-10-31T00:00:00Z"))).toBe(false);
  });
});

describe("podeAssistir", () => {
  it("grátis sempre, até sem nenhum plano", () => {
    expect(podeAssistir(gratis, [], agora)).toBe(true);
  });
  it("entender abre entender, não participar", () => {
    expect(podeAssistir(entender, [ent("entender")], agora)).toBe(true);
    expect(podeAssistir(participar, [ent("entender")], agora)).toBe(false);
  });
  it("participar abre entender e participar", () => {
    expect(podeAssistir(entender, [ent("participar")], agora)).toBe(true);
    expect(podeAssistir(participar, [ent("participar")], agora)).toBe(true);
  });
  it("sem plano não abre pagos", () => {
    expect(podeAssistir(entender, [], agora)).toBe(false);
    expect(podeAssistir(participar, [], agora)).toBe(false);
  });
  it("plano vencido não abre", () => {
    const vencido = ent("participar", "canceled", { renova_em: "2026-10-10T00:00:00Z" });
    expect(podeAssistir(participar, [vencido], agora)).toBe(false);
  });
  it("vários direitos: vale o melhor ativo", () => {
    const ents = [
      ent("entender", "canceled", { renova_em: "2026-10-01T00:00:00Z" }),
      ent("participar"),
    ];
    expect(podeAssistir(participar, ents, agora)).toBe(true);
  });
  it("produto desconhecido não abre nada pago", () => {
    expect(podeAssistir(entender, [ent("outro")], agora)).toBe(false);
  });
});

describe("Desafio 7 Dias", () => {
  const comprado = (iso: string) => [ent("desafio", "active", { comprado_em: iso })];

  it("dia 1 é o dia da compra", () => {
    expect(diaDoDesafio(comprado("2026-10-18T08:00:00Z"), agora)).toBe(1);
    expect(podeAssistir(doDesafio(1), comprado("2026-10-18T08:00:00Z"), agora)).toBe(true);
    expect(podeAssistir(doDesafio(2), comprado("2026-10-18T08:00:00Z"), agora)).toBe(false);
  });
  it("libera um vídeo por dia", () => {
    const c = comprado("2026-10-15T08:00:00Z");
    expect(diaDoDesafio(c, agora)).toBe(4);
    expect(podeAssistir(doDesafio(4), c, agora)).toBe(true);
    expect(podeAssistir(doDesafio(5), c, agora)).toBe(false);
  });
  it("nunca passa do dia 7", () => {
    expect(diaDoDesafio(comprado("2026-09-01T08:00:00Z"), agora)).toBe(7);
  });
  it("não abre vídeos fora do desafio", () => {
    expect(podeAssistir(entender, comprado("2026-10-10T08:00:00Z"), agora)).toBe(false);
  });
  it("virada de dia: libera à meia-noite, não 24 h depois", () => {
    const c = comprado("2026-10-17T21:30:00Z"); // 23:30 do dia 17 em Madri
    expect(diaDoDesafio(c, new Date("2026-10-17T22:30:00Z"), "Europe/Madrid")).toBe(2); // 00:30 do dia 18
  });
  it("virada de fuso: o mesmo instante é dia 1 em São Paulo e dia 2 em Madri", () => {
    const c = comprado("2026-10-17T21:30:00Z");
    const instante = new Date("2026-10-17T23:00:00Z");
    expect(diaDoDesafio(c, instante, "America/Sao_Paulo")).toBe(1);
    expect(diaDoDesafio(c, instante, "Europe/Madrid")).toBe(2);
    expect(podeAssistir(doDesafio(2), c, instante, "America/Sao_Paulo")).toBe(false);
    expect(podeAssistir(doDesafio(2), c, instante, "Europe/Madrid")).toBe(true);
  });
  it("Tóquio adianta o dia", () => {
    const c = comprado("2026-10-17T12:00:00Z"); // 21:00 do dia 17 em Tóquio
    expect(diaDoDesafio(c, new Date("2026-10-17T16:00:00Z"), "Asia/Tokyo")).toBe(2);
  });
  it("desafio cancelado e vencido não libera nada", () => {
    const c = [
      ent("desafio", "canceled", {
        renova_em: "2026-10-10T00:00:00Z",
        comprado_em: "2026-10-01T00:00:00Z",
      }),
    ];
    expect(diaDoDesafio(c, agora)).toBe(0);
  });
  it("sem desafio, dia 0", () => {
    expect(diaDoDesafio([ent("entender")], agora)).toBe(0);
  });
});

describe("motivoBloqueio", () => {
  it("null quando pode", () => {
    expect(motivoBloqueio(gratis, [], agora)).toBeNull();
  });
  it("explica o motivo", () => {
    expect(motivoBloqueio(entender, [], agora)).toBe("sem_plano");
    expect(motivoBloqueio(participar, [ent("entender")], agora)).toBe("plano_participar");
    const d = [ent("desafio", "active", { comprado_em: "2026-10-18T08:00:00Z" })];
    expect(motivoBloqueio(doDesafio(3), d, agora)).toBe("desafio_dia_futuro");
    expect(motivoBloqueio(entender, d, agora)).toBe("fora_do_desafio");
  });
  it("produtosAtivos lista só os que valem", () => {
    const ents = [
      ent("entender"),
      ent("participar", "canceled", { renova_em: "2026-10-01T00:00:00Z" }),
    ];
    expect([...produtosAtivos(ents, agora)]).toEqual(["entender"]);
  });
});
