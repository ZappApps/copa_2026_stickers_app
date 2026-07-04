import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useCollection } from "@/hooks/use-collection";
import { parseText, ParsedSticker } from "@/lib/sticker-parser";
import { COUNTRY_FLAGS, COUNTRY_NAMES } from "@/lib/stickers-seed";
import { addTrade } from "@/lib/database";

interface CompareResult {
  iCanGiveThem: string[];
  theyCanGiveMe: string[];
}

function StickerBadge({ id, color }: { id: string; color: string }) {
  const code = id.replace(/\d+$/, "");
  return (
    <View
      style={{
        backgroundColor: color + "22",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        margin: 3,
        borderWidth: 1.5,
        borderColor: color + "66",
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: "700" }}>{id}</Text>
    </View>
  );
}

function ResultSection({
  title,
  icon,
  stickers,
  color,
  emptyText,
}: {
  title: string;
  icon: string;
  stickers: string[];
  color: string;
  emptyText: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: color + "44",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1A1A1A" }}>{title}</Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            {stickers.length} figurinha{stickers.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: color,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>{stickers.length}</Text>
        </View>
      </View>
      {stickers.length === 0 ? (
        <Text style={{ color: "#9CA3AF", fontSize: 13, fontStyle: "italic" }}>{emptyText}</Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {stickers.map((id) => (
            <StickerBadge key={id} id={id} color={color} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CompareScreen() {
  const [friendList, setFriendList] = useState("");
  const [friendName, setFriendName] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [parsedFriend, setParsedFriend] = useState<ParsedSticker[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getMissing, getDuplicates } = useCollection();

  const handleCompare = () => {
    if (!friendList.trim()) return;
    setProcessing(true);

    try {
      const parsed = parseText(friendList);
      if (parsed.stickers.length === 0) {
        Alert.alert(
          "Nenhuma figurinha encontrada",
          "Não foi possível identificar figurinhas na lista. Verifique o formato (ex: BRA12, SCO6)."
        );
        return;
      }

      setParsedFriend(parsed.stickers);

      const myMissing = getMissing().map((s) => s.id);
      const myDuplicates = getDuplicates().map((s) => s.id);
      const friendIds = new Set(parsed.stickers.map((s) => s.stickerId.toUpperCase()));
      const myMissingSet = new Set(myMissing);
      const myDuplicatesSet = new Set(myDuplicates);

      // What I can give them: my duplicates that they need (they listed as missing/wanted)
      const iCanGiveThem = myDuplicates.filter((id) => friendIds.has(id));

      // What they can give me: stickers they have (listed) that I'm missing
      const theyCanGiveMe = parsed.stickers
        .map((s) => s.stickerId.toUpperCase())
        .filter((id) => myMissingSet.has(id));

      setResult({ iCanGiveThem, theyCanGiveMe });
    } finally {
      setProcessing(false);
    }
  };

  const handleRegisterTrade = async () => {
    if (!result) return;
    const given = result.iCanGiveThem;
    const received = result.theyCanGiveMe;

    if (given.length === 0 && received.length === 0) {
      Alert.alert("Nenhuma troca possível", "Não há figurinhas para trocar.");
      return;
    }

    const name = friendName.trim() || "Amigo";
    setSaving(true);
    try {
      await addTrade(name, given, received, "Troca registrada via comparação de listas");
      Alert.alert(
        "✅ Troca registrada!",
        `Troca com ${name} registrada com sucesso!\n\nDeu: ${given.length} figurinha(s)\nRecebeu: ${received.length} figurinha(s)`,
        [
          {
            text: "OK",
            onPress: () => {
              setResult(null);
              setFriendList("");
              setFriendName("");
              setParsedFriend([]);
            },
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#00843D", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase" }}>
          🔄 Comparar
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 2 }}>
          Lista do Amigo
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {!result ? (
          <>
            {/* Friend Name */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 }}>
              Nome do amigo (opcional):
            </Text>
            <TextInput
              value={friendName}
              onChangeText={setFriendName}
              placeholder="Ex: João, Maria..."
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: "#1A1A1A",
                borderWidth: 2,
                borderColor: "#E5E7EB",
                marginBottom: 16,
              }}
            />

            {/* Friend List Input */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 }}>
              Cole a lista de figurinhas do amigo:
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>
              Pode ser a lista de repetidas ou faltantes do amigo
            </Text>
            <TextInput
              value={friendList}
              onChangeText={setFriendList}
              multiline
              placeholder={"Cole a lista aqui...\n\nEx:\nBRA12(x2), BRA13(x1)\nSCO6(x2), SCO9(x1)"}
              placeholderTextColor="#9CA3AF"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                fontSize: 14,
                color: "#1A1A1A",
                borderWidth: 2,
                borderColor: "#E5E7EB",
                textAlignVertical: "top",
                minHeight: 180,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={handleCompare}
              disabled={!friendList.trim() || processing}
              style={{
                backgroundColor: friendList.trim() ? "#00843D" : "#E5E7EB",
                padding: 18,
                borderRadius: 14,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={{ fontSize: 18 }}>🔍</Text>
                  <Text
                    style={{
                      color: friendList.trim() ? "#FFFFFF" : "#9CA3AF",
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    Comparar Listas
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Results */}
            <View
              style={{
                backgroundColor: "#00843D",
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 28 }}>🎯</Text>
              <View>
                <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "900" }}>
                  Resultado da Comparação
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                  {friendName || "Amigo"} · {parsedFriend.length} figurinhas analisadas
                </Text>
              </View>
            </View>

            <ResultSection
              title="Você pode dar para ele"
              icon="🟢"
              stickers={result.iCanGiveThem}
              color="#00843D"
              emptyText="Você não tem repetidas que ele precisa"
            />

            <ResultSection
              title="Ele pode te dar"
              icon="🔵"
              stickers={result.theyCanGiveMe}
              color="#2563EB"
              emptyText="Ele não tem figurinhas que você precisa"
            />

            {/* Register Trade Button */}
            {(result.iCanGiveThem.length > 0 || result.theyCanGiveMe.length > 0) && (
              <TouchableOpacity
                onPress={handleRegisterTrade}
                disabled={saving}
                style={{
                  backgroundColor: "#FFD700",
                  padding: 18,
                  borderRadius: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#1A1A1A" />
                ) : (
                  <>
                    <Text style={{ fontSize: 18 }}>✅</Text>
                    <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 16 }}>
                      Registrar Troca
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => { setResult(null); setParsedFriend([]); }}
              style={{
                padding: 16,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: "#E5E7EB",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#6B7280", fontWeight: "700" }}>Nova Comparação</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
