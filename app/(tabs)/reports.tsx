import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useCollection } from "@/hooks/use-collection";
import { COUNTRY_FLAGS, COUNTRY_NAMES, COUNTRY_CODES, GROUP_TEAMS } from "@/lib/stickers-seed";

type ReportType = "missing" | "duplicate";

function buildReportText(
  stickers: Array<{ id: string; countryCode: string; number: number; quantity: number }>,
  type: ReportType
): string {
  if (stickers.length === 0) {
    return type === "missing"
      ? "🎉 Álbum completo! Nenhuma figurinha faltante."
      : "Nenhuma figurinha repetida no momento.";
  }

  // Group by country
  const grouped = new Map<string, typeof stickers>();
  for (const s of stickers) {
    if (!grouped.has(s.countryCode)) grouped.set(s.countryCode, []);
    grouped.get(s.countryCode)!.push(s);
  }

  const lines: string[] = [
    `Copa 2026 - Figurinhas ${type === "missing" ? "Faltantes" : "Repetidas"}:`,
    "",
  ];

  // Order by group
  const orderedCodes: string[] = [];
  Object.values(GROUP_TEAMS).forEach((codes) => {
    codes.forEach((c) => { if (grouped.has(c)) orderedCodes.push(c); });
  });
  // Add any remaining
  grouped.forEach((_, code) => { if (!orderedCodes.includes(code)) orderedCodes.push(code); });

  for (const code of orderedCodes) {
    const items = grouped.get(code)!;
    const flag = COUNTRY_FLAGS[code] || "";
    const name = COUNTRY_NAMES[code] || code;
    const list = items
      .sort((a, b) => a.number - b.number)
      .map((s) => (type === "duplicate" ? `${s.id}(x${s.quantity - 1})` : s.id))
      .join(", ");
    lines.push(`${flag} ${name}:`);
    lines.push(list);
    lines.push("");
  }

  lines.push(`Total: ${stickers.length} figurinha${stickers.length !== 1 ? "s" : ""}`);
  return lines.join("\n");
}

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<ReportType>("missing");
  const { getMissing, getDuplicates, stats, loading } = useCollection();

  const missingStickers = useMemo(() => getMissing(), [getMissing]);
  const duplicateStickers = useMemo(() => getDuplicates(), [getDuplicates]);

  const currentStickers = activeTab === "missing" ? missingStickers : duplicateStickers;
  const reportText = useMemo(
    () => buildReportText(currentStickers, activeTab),
    [currentStickers, activeTab]
  );

  const handleCopy = async () => {
    await Clipboard.setStringAsync(reportText);
    Alert.alert("✅ Copiado!", "Lista copiada para a área de transferência.");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: reportText,
        title: `Figurinhas Copa 2026 - ${activeTab === "missing" ? "Faltantes" : "Repetidas"}`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Group stickers for display
  const grouped = useMemo(() => {
    const map = new Map<string, typeof currentStickers>();
    for (const s of currentStickers) {
      if (!map.has(s.countryCode)) map.set(s.countryCode, []);
      map.get(s.countryCode)!.push(s);
    }

    const result: Array<{ code: string; stickers: typeof currentStickers }> = [];
    Object.values(GROUP_TEAMS).forEach((codes) => {
      codes.forEach((c) => {
        if (map.has(c)) result.push({ code: c, stickers: map.get(c)! });
      });
    });
    map.forEach((stickers, code) => {
      if (!result.find((r) => r.code === code)) result.push({ code, stickers });
    });
    return result;
  }, [currentStickers]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#00843D", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase" }}>
          📋 Relatórios
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 2 }}>
          Minhas Listas
        </Text>

        {/* Tabs */}
        <View style={{ flexDirection: "row", marginTop: 16, gap: 8 }}>
          <TouchableOpacity
            onPress={() => setActiveTab("missing")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: activeTab === "missing" ? "#C8102E" : "rgba(255,255,255,0.15)",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
              ❌ Faltantes ({stats.missing})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("duplicate")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: activeTab === "duplicate" ? "#FFD700" : "rgba(255,255,255,0.15)",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: activeTab === "duplicate" ? "#1A1A1A" : "#FFFFFF",
                fontWeight: "800",
                fontSize: 14,
              }}
            >
              🔁 Repetidas ({stats.duplicates})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          padding: 16,
          gap: 10,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={handleCopy}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#F3F4F6",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>📋</Text>
          <Text style={{ fontWeight: "700", color: "#1A1A1A", fontSize: 14 }}>Copiar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleShare}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#00843D",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16 }}>📤</Text>
          <Text style={{ fontWeight: "700", color: "#FFFFFF", fontSize: 14 }}>Compartilhar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#00843D" />
        </View>
      ) : currentStickers.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>
            {activeTab === "missing" ? "🎉" : "📦"}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A", textAlign: "center" }}>
            {activeTab === "missing" ? "Álbum completo!" : "Sem repetidas"}
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8 }}>
            {activeTab === "missing"
              ? "Parabéns! Você completou o álbum da Copa 2026!"
              : "Você não tem figurinhas repetidas no momento."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {grouped.map(({ code, stickers }) => (
            <View
              key={code}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
                <Text style={{ fontSize: 20 }}>{COUNTRY_FLAGS[code] || "🏳️"}</Text>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1A1A1A", flex: 1 }}>
                  {COUNTRY_NAMES[code] || code}
                </Text>
                <View
                  style={{
                    backgroundColor: activeTab === "missing" ? "#FEE2E2" : "#FEF9C3",
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: activeTab === "missing" ? "#C8102E" : "#854D0E",
                    }}
                  >
                    {stickers.length}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {stickers
                  .sort((a, b) => a.number - b.number)
                  .map((s) => (
                    <View
                      key={s.id}
                      style={{
                        backgroundColor:
                          activeTab === "missing" ? "#FEE2E2" : "#FEF9C3",
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: activeTab === "missing" ? "#C8102E" : "#854D0E",
                        }}
                      >
                        {s.id}
                        {activeTab === "duplicate" && s.quantity > 1
                          ? ` (x${s.quantity - 1})`
                          : ""}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
