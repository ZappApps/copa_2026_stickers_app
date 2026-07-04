import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useCollection, EnrichedSticker } from "@/hooks/use-collection";
import { COUNTRY_CODES, COUNTRY_NAMES, COUNTRY_FLAGS, GROUP_TEAMS } from "@/lib/stickers-seed";
import { updateStickerQuantity } from "@/lib/database";
import { useLocalSearchParams } from "expo-router";

type FilterType = "all" | "owned" | "missing" | "duplicate";

const FILTER_OPTIONS: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "Todas", color: "#6B7280" },
  { key: "owned", label: "Coladas", color: "#00843D" },
  { key: "missing", label: "Faltantes", color: "#C8102E" },
  { key: "duplicate", label: "Repetidas", color: "#FFD700" },
];

function StickerChip({
  sticker,
  onPress,
}: {
  sticker: EnrichedSticker;
  onPress: (s: EnrichedSticker) => void;
}) {
  const bgColor =
    sticker.quantity === 0
      ? "#F3F4F6"
      : sticker.quantity === 1
      ? "#DCFCE7"
      : "#FEF9C3";

  const textColor =
    sticker.quantity === 0
      ? "#9CA3AF"
      : sticker.quantity === 1
      ? "#166534"
      : "#854D0E";

  const borderColor =
    sticker.quantity === 0
      ? "#E5E7EB"
      : sticker.quantity === 1
      ? "#86EFAC"
      : "#FDE047";

  return (
    <TouchableOpacity
      onPress={() => onPress(sticker)}
      style={{
        backgroundColor: bgColor,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        margin: 3,
        borderWidth: 1.5,
        borderColor,
        minWidth: 52,
        alignItems: "center",
      }}
      activeOpacity={0.7}
    >
      <Text style={{ color: textColor, fontSize: 12, fontWeight: "700" }}>
        {sticker.countryCode}{sticker.number}
      </Text>
      {sticker.quantity > 1 && (
        <Text style={{ color: textColor, fontSize: 10, fontWeight: "600" }}>
          x{sticker.quantity}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function StickerDetailModal({
  sticker,
  onClose,
  onUpdate,
}: {
  sticker: EnrichedSticker;
  onClose: () => void;
  onUpdate: (id: string, qty: number) => void;
}) {
  const [qty, setQty] = useState(sticker.quantity);
  const [saving, setSaving] = useState(false);

  const save = async (newQty: number) => {
    setSaving(true);
    await updateStickerQuantity(sticker.id, newQty);
    onUpdate(sticker.id, newQty);
    setSaving(false);
    onClose();
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        zIndex: 100,
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#1A1A1A", marginBottom: 4 }}>
          {COUNTRY_FLAGS[sticker.countryCode] || "🏳️"} {sticker.id}
        </Text>
        <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
          {sticker.playerName}
        </Text>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginBottom: 12 }}>
          Quantidade no álbum:
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setQty(Math.max(0, qty - 1))}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#1A1A1A" }}>−</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 32, fontWeight: "900", color: "#00843D", minWidth: 40, textAlign: "center" }}>
            {qty}
          </Text>
          <TouchableOpacity
            onPress={() => setQty(qty + 1)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#00843D",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#FFFFFF" }}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#E5E7EB",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6B7280", fontWeight: "700" }}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => save(qty)}
            disabled={saving}
            style={{
              flex: 2,
              padding: 16,
              borderRadius: 12,
              backgroundColor: "#00843D",
              alignItems: "center",
            }}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function AlbumScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<FilterType>((params.filter as FilterType) || "all");
  const [search, setSearch] = useState("");
  const [selectedSticker, setSelectedSticker] = useState<EnrichedSticker | null>(null);
  const { getEnrichedStickers, loading, collection, updateSticker } = useCollection();

  const sections = useMemo(() => {
    const groups = Object.entries(GROUP_TEAMS);
    return groups.map(([group, codes]) => {
      const stickers = codes.flatMap((code) =>
        getEnrichedStickers(filter, code).filter((s) => {
          if (!search) return true;
          return (
            s.id.toLowerCase().includes(search.toLowerCase()) ||
            s.playerName.toLowerCase().includes(search.toLowerCase()) ||
            s.countryName.toLowerCase().includes(search.toLowerCase())
          );
        })
      );
      return {
        title: group === "SPECIAL" ? "Especiais" : `Grupo ${group}`,
        data: stickers,
        codes,
      };
    }).filter((s) => s.data.length > 0);
  }, [filter, search, getEnrichedStickers, collection]);

  const handleStickerPress = useCallback((sticker: EnrichedSticker) => {
    setSelectedSticker(sticker);
  }, []);

  const handleUpdate = useCallback(
    (id: string, qty: number) => {
      updateSticker(id, qty);
    },
    [updateSticker]
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#00843D" />
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#00843D", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase" }}>
          🏆 Copa 2026
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 2 }}>
          Meu Álbum
        </Text>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            paddingHorizontal: 14,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por código ou país..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ flex: 1, color: "#FFFFFF", paddingVertical: 10, paddingHorizontal: 8, fontSize: 15 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
          gap: 8,
        }}
      >
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setFilter(opt.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: filter === opt.key ? opt.color : "#F3F4F6",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: filter === opt.key ? (opt.key === "duplicate" ? "#1A1A1A" : "#FFFFFF") : "#6B7280",
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stickers List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              backgroundColor: "#F5F5F5",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1A1A" }}>
              {section.title}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              {section.codes.map((c) => `${COUNTRY_FLAGS[c] || ""} ${COUNTRY_NAMES[c] || c}`).join("  ·  ")}
            </Text>
          </View>
        )}
        renderItem={({ item }) => null}
        renderSectionFooter={({ section }) => (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              padding: 12,
              backgroundColor: "#FFFFFF",
              marginBottom: 8,
            }}
          >
            {section.data.map((sticker) => (
              <StickerChip key={sticker.id} sticker={sticker} onPress={handleStickerPress} />
            ))}
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Sticker Detail Modal */}
      {selectedSticker && (
        <StickerDetailModal
          sticker={selectedSticker}
          onClose={() => setSelectedSticker(null)}
          onUpdate={handleUpdate}
        />
      )}
    </View>
  );
}
