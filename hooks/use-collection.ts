import { useState, useEffect, useCallback } from "react";
import {
  getStats,
  getMissingStickers,
  getDuplicateStickers,
  getCollection,
  updateStickerQuantity,
  bulkIncrementStickers,
  CollectionStats,
  CollectionRow,
} from "@/lib/database";
import { ALL_STICKERS, STICKER_MAP, StickerMaster } from "@/lib/stickers-seed";

export interface EnrichedSticker extends StickerMaster {
  quantity: number;
}

export function useCollection() {
  const [stats, setStats] = useState<CollectionStats>({
    total: 980,
    owned: 0,
    missing: 980,
    duplicates: 0,
    completionPercent: 0,
  });
  const [collection, setCollection] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, collectionData] = await Promise.all([
        getStats(),
        getCollection(),
      ]);
      setStats(statsData);
      const map: Record<string, number> = {};
      collectionData.forEach((row: CollectionRow) => {
        map[row.sticker_id] = row.quantity;
      });
      setCollection(map);
    } catch (e) {
      console.error("Error loading collection:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSticker = useCallback(
    async (stickerId: string, quantity: number) => {
      await updateStickerQuantity(stickerId, quantity);
      setCollection((prev) => ({ ...prev, [stickerId.toUpperCase()]: Math.max(0, quantity) }));
      // Refresh stats
      const newStats = await getStats();
      setStats(newStats);
    },
    []
  );

  const addStickers = useCallback(
    async (stickers: Array<{ stickerId: string; amount?: number }>) => {
      await bulkIncrementStickers(stickers);
      await refresh();
    },
    [refresh]
  );

  const getEnrichedStickers = useCallback(
    (filter?: "all" | "owned" | "missing" | "duplicate", countryCode?: string): EnrichedSticker[] => {
      let stickers = ALL_STICKERS;
      if (countryCode) {
        stickers = stickers.filter((s) => s.countryCode === countryCode);
      }
      return stickers
        .map((s) => ({ ...s, quantity: collection[s.id] ?? 0 }))
        .filter((s) => {
          if (!filter || filter === "all") return true;
          if (filter === "owned") return s.quantity >= 1;
          if (filter === "missing") return s.quantity === 0;
          if (filter === "duplicate") return s.quantity > 1;
          return true;
        });
    },
    [collection]
  );

  const getMissing = useCallback((): EnrichedSticker[] => {
    return ALL_STICKERS
      .filter((s) => (collection[s.id] ?? 0) === 0)
      .map((s) => ({ ...s, quantity: 0 }));
  }, [collection]);

  const getDuplicates = useCallback((): EnrichedSticker[] => {
    return ALL_STICKERS
      .filter((s) => (collection[s.id] ?? 0) > 1)
      .map((s) => ({ ...s, quantity: collection[s.id] ?? 0 }));
  }, [collection]);

  return {
    stats,
    collection,
    loading,
    refresh,
    updateSticker,
    addStickers,
    getEnrichedStickers,
    getMissing,
    getDuplicates,
  };
}
