import { describe, it, expect } from "vitest";
import { parseText, parseOcrText, formatStickerList } from "../lib/sticker-parser";

describe("parseText - formato padrão", () => {
  it("deve reconhecer código simples BRA12", () => {
    const result = parseText("BRA12");
    expect(result.stickers.length).toBeGreaterThan(0);
    expect(result.stickers[0].stickerId).toBe("BRA12");
    expect(result.stickers[0].quantity).toBe(1);
  });

  it("deve reconhecer múltiplos códigos separados por vírgula", () => {
    const result = parseText("BRA1, BRA2, BRA3");
    expect(result.stickers.length).toBe(3);
  });

  it("deve reconhecer quantidade no formato (x2)", () => {
    const result = parseText("BRA12(x2)");
    expect(result.stickers[0].quantity).toBe(2);
  });

  it("deve reconhecer quantidade no formato x3", () => {
    const result = parseText("BRA12 x3");
    expect(result.stickers[0].quantity).toBe(3);
  });

  it("deve reconhecer o formato completo da lista compartilhada", () => {
    const text = `Copa 2026:
FWC1(x1), FWC2(x1)

BRA:
BRA1(x1), BRA2(x2), BRA3(x1)

ARG:
ARG13(x2)`;
    const result = parseText(text);
    expect(result.stickers.length).toBeGreaterThan(0);
    const arg13 = result.stickers.find((s) => s.stickerId === "ARG13");
    expect(arg13).toBeDefined();
    expect(arg13?.quantity).toBe(2);
  });

  it("deve reconhecer figurinhas especiais FWC", () => {
    const result = parseText("FWC1 FWC2 FWC3");
    expect(result.stickers.length).toBe(3);
    expect(result.stickers[0].stickerId).toBe("FWC1");
  });

  it("deve reconhecer figurinhas Coca-Cola CC", () => {
    const result = parseText("CC10(x1)");
    expect(result.stickers.length).toBeGreaterThan(0);
  });

  it("deve ignorar códigos inválidos (número fora do range)", () => {
    // BRA99 não existe no álbum (apenas BRA1-BRA20), deve ir para unrecognized
    const result = parseText("BRA99 BRA1");
    expect(result.stickers.some((s) => s.stickerId === "BRA1")).toBe(true);
    // BRA99 deve ser ignorado (não existe no mapa de figurinhas)
    expect(result.stickers.some((s) => s.stickerId === "BRA99")).toBe(false);
  });

  it("deve acumular quantidades de entradas duplicadas", () => {
    const result = parseText("BRA1(x2) BRA1(x3)");
    const bra1 = result.stickers.find((s) => s.stickerId === "BRA1");
    expect(bra1?.quantity).toBe(5);
  });
});

describe("parseOcrText - texto de OCR de figurinhas Panini", () => {
  it("deve extrair código do texto OCR com ruído", () => {
    const ocrText = "FIFA WORLD CUP 2026  BRA 12  PANINI official licensed product";
    const result = parseOcrText(ocrText);
    expect(result.stickers.some((s) => s.stickerId === "BRA12")).toBe(true);
  });

  it("deve extrair múltiplos códigos de texto OCR", () => {
    const ocrText = "FIFA WORLD CUP 2026 SCO 7\nFIFA WORLD CUP 2026 SCO 11\nFIFA WORLD CUP 2026 RSA 1";
    const result = parseOcrText(ocrText);
    expect(result.stickers.length).toBeGreaterThan(0);
  });
});

describe("formatStickerList - formatação de saída", () => {
  it("deve formatar lista agrupada por país", () => {
    const stickers = [
      { stickerId: "BRA1", quantity: 1 },
      { stickerId: "BRA2", quantity: 2 },
      { stickerId: "ARG1", quantity: 1 },
    ];
    const output = formatStickerList(stickers, true);
    expect(output).toContain("BRA");
    expect(output).toContain("ARG");
    expect(output).toContain("BRA1(x1)");
    expect(output).toContain("BRA2(x2)");
  });

  it("deve formatar lista sem agrupamento", () => {
    const stickers = [
      { stickerId: "BRA1", quantity: 1 },
      { stickerId: "ARG1", quantity: 2 },
    ];
    const output = formatStickerList(stickers, false);
    expect(output).toBe("BRA1(x1), ARG1(x2)");
  });
});
