import { STICKER_MAP, COUNTRY_CODES } from "./stickers-seed";

export interface ParsedSticker {
  stickerId: string;
  quantity: number;
  raw: string; // original matched text
}

export interface ParseResult {
  stickers: ParsedSticker[];
  unrecognized: string[];
  total: number;
}

// Regex to match sticker codes like BRA12, FWC1, CC10, etc.
// Handles optional space between code and number
const COUNTRY_PATTERN = COUNTRY_CODES.join("|");
const STICKER_REGEX = new RegExp(
  `\\b(${COUNTRY_PATTERN})\\s*(\\d{1,2})\\b`,
  "gi"
);

// Regex to detect quantity markers: (x2), x2, *2, 2x, [2], {2}
const QUANTITY_REGEX = /[\(\[\{]?[xX\*]?\s*(\d+)\s*[xX]?\s*[\)\]\}]?/;

/**
 * Parse a free-form text string and extract sticker codes with quantities.
 * Supports formats like:
 * - BRA12(x2), BRA13
 * - BRA 12 x2, BRA 13
 * - BRA12*2, BRA13
 * - BRA: 12(x2), 13, 14
 * - Lista de repetidas: BRA12 x2, SCO6
 */
export function parseText(text: string): ParseResult {
  const stickers: ParsedSticker[] = [];
  const unrecognized: string[] = [];
  const found = new Map<string, number>();

  // Normalize text: remove common prefixes/headers
  const normalized = text
    .replace(/figurinhas\s*(da\s*copa|repetidas|faltantes|para\s*troca)?:?/gi, "")
    .replace(/lista\s*(de\s*)?(repetidas|faltantes|trocas)?:?/gi, "")
    .replace(/copa\s*2026:?/gi, "")
    .replace(/grupo\s*[a-l]:?/gi, "")
    .replace(/história\s*da\s*copa:?/gi, "")
    .replace(/coleção\s*coca.cola:?/gi, "");

  // Find all sticker code matches
  let match: RegExpExecArray | null;
  STICKER_REGEX.lastIndex = 0;

  while ((match = STICKER_REGEX.exec(normalized)) !== null) {
    const code = match[1].toUpperCase();
    const num = parseInt(match[2], 10);
    const stickerId = `${code}${num}`;

    // Validate sticker exists in master list
    if (!STICKER_MAP[stickerId]) {
      unrecognized.push(stickerId);
      continue;
    }

    // Look for quantity in the text immediately after the match
    const afterMatch = normalized.slice(match.index + match[0].length, match.index + match[0].length + 10);
    let quantity = 1;

    // Check for quantity patterns right after the code
    const qMatch = afterMatch.match(/^\s*[\(\[\{]?[xX\*]?\s*(\d+)\s*[xX]?\s*[\)\]\}]?/);
    if (qMatch && qMatch[1]) {
      const q = parseInt(qMatch[1], 10);
      if (q > 1 && q <= 99) {
        quantity = q;
      }
    }

    // Accumulate quantities for duplicate entries
    found.set(stickerId, (found.get(stickerId) || 0) + quantity);
  }

  // Convert map to array
  found.forEach((quantity, stickerId) => {
    stickers.push({
      stickerId,
      quantity,
      raw: stickerId,
    });
  });

  return {
    stickers,
    unrecognized: [...new Set(unrecognized)],
    total: stickers.reduce((sum, s) => sum + s.quantity, 0),
  };
}

/**
 * Parse OCR text from a sticker photo.
 * Optimized for the Panini FIFA World Cup 2026 sticker format:
 * "FIFA WORLD CUP 2026  BRA 12"
 */
export function parseOcrText(ocrText: string): ParseResult {
  // OCR text may have noise, so we apply extra normalization
  const cleaned = ocrText
    .replace(/FIFA\s*WORLD\s*CUP\s*2026/gi, "")
    .replace(/PANINI/gi, "")
    .replace(/official\s*licensed\s*product/gi, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return parseText(cleaned);
}

/**
 * Format a list of sticker IDs into the standard sharing format:
 * BRA:
 * BRA12(x1), BRA13(x2)
 */
export function formatStickerList(
  stickers: Array<{ stickerId: string; quantity: number }>,
  groupByCountry = true
): string {
  if (!groupByCountry) {
    return stickers
      .map((s) => `${s.stickerId}(x${s.quantity})`)
      .join(", ");
  }

  // Group by country code
  const grouped = new Map<string, Array<{ stickerId: string; quantity: number }>>();
  for (const s of stickers) {
    const code = s.stickerId.replace(/\d+$/, "");
    if (!grouped.has(code)) grouped.set(code, []);
    grouped.get(code)!.push(s);
  }

  const lines: string[] = ["Copa 2026 - Figurinhas:"];
  grouped.forEach((items, code) => {
    const stickerList = items
      .sort((a, b) => {
        const na = parseInt(a.stickerId.replace(/\D/g, ""), 10);
        const nb = parseInt(b.stickerId.replace(/\D/g, ""), 10);
        return na - nb;
      })
      .map((s) => `${s.stickerId}(x${s.quantity})`)
      .join(", ");
    lines.push(`\n${code}:\n${stickerList}`);
  });

  return lines.join("\n");
}

/**
 * Compare two lists of sticker IDs:
 * - myDuplicates: stickers I have more than 1 of (available to give)
 * - theirMissing: stickers they need
 * Returns matches (stickers I can give them) and vice versa.
 */
export interface CompareResult {
  iCanGiveThem: string[]; // I have duplicates they need
  theyCanGiveMe: string[]; // They have duplicates I need
  bothNeed: string[]; // Both are missing
}

export function compareLists(
  myMissing: string[],
  myDuplicates: string[],
  theirList: ParsedSticker[] // list from friend (could be their missing or their duplicates)
): CompareResult {
  const theirIds = new Set(theirList.map((s) => s.stickerId.toUpperCase()));
  const myMissingSet = new Set(myMissing.map((s) => s.toUpperCase()));
  const myDuplicatesSet = new Set(myDuplicates.map((s) => s.toUpperCase()));

  const iCanGiveThem: string[] = [];
  const theyCanGiveMe: string[] = [];
  const bothNeed: string[] = [];

  // Check what they need vs what I have
  theirIds.forEach((id) => {
    if (myDuplicatesSet.has(id)) {
      iCanGiveThem.push(id);
    }
    if (myMissingSet.has(id)) {
      bothNeed.push(id);
    }
  });

  // Check what I need vs what they have
  myMissingSet.forEach((id) => {
    if (theirIds.has(id) && !bothNeed.includes(id)) {
      theyCanGiveMe.push(id);
    }
  });

  return { iCanGiveThem, theyCanGiveMe, bothNeed };
}
