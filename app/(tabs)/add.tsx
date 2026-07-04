import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "@/components/screen-container";
import { parseText, parseOcrText, ParsedSticker } from "@/lib/sticker-parser";
import { STICKER_MAP, COUNTRY_FLAGS, COUNTRY_NAMES } from "@/lib/stickers-seed";
import { useCollection } from "@/hooks/use-collection";
import { trpc } from "@/lib/trpc";

type TabType = "text" | "camera" | "file";

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "text", label: "Texto", icon: "📝" },
  { key: "camera", label: "Câmera", icon: "📸" },
  { key: "file", label: "Arquivo", icon: "📂" },
];

// OCR is called via tRPC mutation hook inside the component

function ConfirmationList({
  stickers,
  onConfirm,
  onCancel,
  loading,
}: {
  stickers: ParsedSticker[];
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const grouped = stickers.reduce(
    (acc, s) => {
      const code = s.stickerId.replace(/\d+$/, "");
      if (!acc[code]) acc[code] = [];
      acc[code].push(s);
      return acc;
    },
    {} as Record<string, ParsedSticker[]>
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: "#DCFCE7",
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 20 }}>✅</Text>
        <View>
          <Text style={{ fontWeight: "800", color: "#166534", fontSize: 15 }}>
            {stickers.length} figurinha{stickers.length !== 1 ? "s" : ""} identificada{stickers.length !== 1 ? "s" : ""}
          </Text>
          <Text style={{ color: "#166534", fontSize: 13 }}>
            Total de {stickers.reduce((s, x) => s + x.quantity, 0)} unidades
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([code, items]) => (
          <View key={code} style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#6B7280", marginBottom: 6 }}>
              {COUNTRY_FLAGS[code] || "🏳️"} {COUNTRY_NAMES[code] || code}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {items.map((s) => (
                <View
                  key={s.stickerId}
                  style={{
                    backgroundColor: "#DCFCE7",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: "#86EFAC",
                  }}
                >
                  <Text style={{ color: "#166534", fontWeight: "700", fontSize: 13 }}>
                    {s.stickerId}
                    {s.quantity > 1 ? ` (x${s.quantity})` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <TouchableOpacity
          onPress={onCancel}
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
          onPress={onConfirm}
          disabled={loading}
          style={{
            flex: 2,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#00843D",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>
              Adicionar ao Álbum ✓
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AddScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [textInput, setTextInput] = useState("");
  const [parsedStickers, setParsedStickers] = useState<ParsedSticker[] | null>(null);
  const [unrecognized, setUnrecognized] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addStickers, refresh } = useCollection();
  const ocrMutation = trpc.ocr.recognize.useMutation();

  const processText = (text: string) => {
    const result = parseText(text);
    if (result.stickers.length === 0) {
      Alert.alert(
        "Nenhuma figurinha encontrada",
        "Não foi possível identificar figurinhas no texto. Verifique o formato (ex: BRA12, SCO6)."
      );
      return;
    }
    setParsedStickers(result.stickers);
    setUnrecognized(result.unrecognized);
  };

  const handleTextProcess = () => {
    if (!textInput.trim()) return;
    processText(textInput);
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera para fotografar as figurinhas.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.8,
      base64: false,
    });

    if (result.canceled) return;

    setProcessing(true);
    try {
      const imageUri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ocrResult = await ocrMutation.mutateAsync({ imageBase64: base64, mimeType: "image/jpeg" });
      const rawText = ocrResult.text;
      const ocrText = typeof rawText === "string" ? rawText : "";
      if (!ocrText) {
        Alert.alert("Erro no OCR", "Não foi possível ler o texto das figurinhas. Tente novamente com melhor iluminação.");
        return;
      }
      const parsed = parseOcrText(ocrText);
      if (parsed.stickers.length === 0) {
        Alert.alert("Nenhuma figurinha identificada", `Texto extraído: "${ocrText}"\n\nTente fotografar o verso das figurinhas com o código visível.`);
        return;
      }
      setParsedStickers(parsed.stickers);
      setUnrecognized(parsed.unrecognized);
    } finally {
      setProcessing(false);
    }
  };

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["text/plain", "application/pdf", "text/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    setProcessing(true);
    try {
      const uri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      processText(content);
    } catch (e) {
      Alert.alert("Erro ao ler arquivo", "Não foi possível ler o arquivo. Certifique-se de que é um arquivo de texto (.txt).");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedStickers) return;
    setSaving(true);
    try {
      await addStickers(
        parsedStickers.map((s) => ({ stickerId: s.stickerId, amount: s.quantity }))
      );
      Alert.alert(
        "✅ Figurinhas adicionadas!",
        `${parsedStickers.length} figurinha(s) foram adicionadas ao seu álbum.`,
        [{ text: "OK", onPress: () => { setParsedStickers(null); setTextInput(""); } }]
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
          📥 Adicionar
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 2 }}>
          Figurinhas
        </Text>

        {/* Tabs */}
        <View style={{ flexDirection: "row", marginTop: 16, gap: 8 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => { setActiveTab(tab.key); setParsedStickers(null); }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: activeTab === tab.key ? "#FFD700" : "rgba(255,255,255,0.15)",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 16 }}>{tab.icon}</Text>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 14,
                  color: activeTab === tab.key ? "#1A1A1A" : "#FFFFFF",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: 20 }}>
        {parsedStickers ? (
          <ConfirmationList
            stickers={parsedStickers}
            onConfirm={handleConfirm}
            onCancel={() => setParsedStickers(null)}
            loading={saving}
          />
        ) : (
          <>
            {/* Text Tab */}
            {activeTab === "text" && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 }}>
                  Cole ou digite a lista de figurinhas:
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                  Formatos aceitos: BRA12, BRA12(x2), BRA 12, BRA: 12, 13, 14...
                </Text>
                <TextInput
                  value={textInput}
                  onChangeText={setTextInput}
                  multiline
                  placeholder={"Exemplo:\nBRA12(x1), BRA13(x2)\nSCO6(x1), SCO9(x1)\n\nOu cole uma lista do WhatsApp..."}
                  placeholderTextColor="#9CA3AF"
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    fontSize: 14,
                    color: "#1A1A1A",
                    borderWidth: 2,
                    borderColor: "#E5E7EB",
                    textAlignVertical: "top",
                    marginBottom: 16,
                    minHeight: 200,
                  }}
                />
                <TouchableOpacity
                  onPress={handleTextProcess}
                  disabled={!textInput.trim()}
                  style={{
                    backgroundColor: textInput.trim() ? "#00843D" : "#E5E7EB",
                    padding: 18,
                    borderRadius: 14,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: textInput.trim() ? "#FFFFFF" : "#9CA3AF",
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    Processar Lista →
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Camera Tab */}
            {activeTab === "camera" && (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: "#DCFCE7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 56 }}>📸</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A", textAlign: "center" }}>
                  Fotografe as figurinhas
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 }}>
                  Aponte a câmera para o verso das figurinhas. O app vai reconhecer automaticamente os códigos usando IA.
                </Text>
                <TouchableOpacity
                  onPress={handleCameraCapture}
                  disabled={processing}
                  style={{
                    backgroundColor: "#00843D",
                    paddingHorizontal: 32,
                    paddingVertical: 18,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {processing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={{ fontSize: 20 }}>📸</Text>
                      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>
                        Abrir Câmera
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
                  Também pode usar a galeria para selecionar uma foto existente
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.8 });
                    if (result.canceled) return;
                    setProcessing(true);
                    try {
                      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
                      const ocrResult = await ocrMutation.mutateAsync({ imageBase64: base64, mimeType: "image/jpeg" });
                      const rawText2 = ocrResult.text;
                      const ocrText = typeof rawText2 === "string" ? rawText2 : "";
                      if (!ocrText) { Alert.alert("Erro no OCR", "Não foi possível ler o texto."); return; }
                      const parsed = parseOcrText(ocrText);
                      if (parsed.stickers.length === 0) { Alert.alert("Nenhuma figurinha identificada"); return; }
                      setParsedStickers(parsed.stickers);
                    } finally { setProcessing(false); }
                  }}
                >
                  <Text style={{ color: "#00843D", fontWeight: "700", fontSize: 14 }}>
                    Selecionar da Galeria
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* File Tab */}
            {activeTab === "file" && (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: "#FEF9C3",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 56 }}>📂</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A", textAlign: "center" }}>
                  Importar Arquivo
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 22 }}>
                  Selecione um arquivo .txt gerado por outros apps de gerenciamento de álbum.
                </Text>
                <TouchableOpacity
                  onPress={handleFilePick}
                  disabled={processing}
                  style={{
                    backgroundColor: "#FFD700",
                    paddingHorizontal: 32,
                    paddingVertical: 18,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {processing ? (
                    <ActivityIndicator color="#1A1A1A" />
                  ) : (
                    <>
                      <Text style={{ fontSize: 20 }}>📂</Text>
                      <Text style={{ color: "#1A1A1A", fontWeight: "800", fontSize: 16 }}>
                        Selecionar Arquivo
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
                  Formatos suportados: .txt{"\n"}
                  Compatível com listas exportadas de outros apps
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
