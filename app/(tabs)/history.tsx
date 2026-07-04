import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getTrades, deleteTrade, TradeRow } from "@/lib/database";

function TradeCard({ trade, onDelete }: { trade: TradeRow; onDelete: (id: number) => void }) {
  const given: string[] = JSON.parse(trade.given_stickers || "[]");
  const received: string[] = JSON.parse(trade.received_stickers || "[]");
  const date = new Date(trade.date);
  const dateStr = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleDelete = () => {
    Alert.alert(
      "Excluir troca",
      `Deseja excluir a troca com ${trade.partner_name}?\n\nAtenção: as figurinhas NÃO serão devolvidas ao acervo.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => onDelete(trade.id) },
      ]
    );
  };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 22 }}>🤝</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#1A1A1A" }}>
            {trade.partner_name}
          </Text>
          <Text style={{ fontSize: 12, color: "#6B7280" }}>
            {dateStr} às {timeStr}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Stickers exchanged */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {/* Given */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#FEE2E2",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#C8102E", marginBottom: 6 }}>
            ↑ DEU ({given.length})
          </Text>
          <Text style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 18 }}>
            {given.length === 0 ? "—" : given.slice(0, 8).join(", ") + (given.length > 8 ? `... +${given.length - 8}` : "")}
          </Text>
        </View>

        {/* Received */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#DCFCE7",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#166534", marginBottom: 6 }}>
            ↓ RECEBEU ({received.length})
          </Text>
          <Text style={{ fontSize: 12, color: "#14532D", lineHeight: 18 }}>
            {received.length === 0 ? "—" : received.slice(0, 8).join(", ") + (received.length > 8 ? `... +${received.length - 8}` : "")}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {trade.notes ? (
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 10, fontStyle: "italic" }}>
          📝 {trade.notes}
        </Text>
      ) : null}
    </View>
  );
}

export default function HistoryScreen() {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrades = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrades();
      setTrades(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const handleDelete = async (id: number) => {
    await deleteTrade(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#00843D", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}>
        <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase" }}>
          📖 Histórico
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginTop: 2 }}>
          Trocas Realizadas
        </Text>
        {!loading && (
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 4 }}>
            {trades.length} troca{trades.length !== 1 ? "s" : ""} registrada{trades.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#00843D" />
        </View>
      ) : trades.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>🤝</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#1A1A1A", textAlign: "center" }}>
            Nenhuma troca ainda
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 22 }}>
            Quando você comparar listas com um amigo e registrar uma troca, ela aparecerá aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TradeCard trade={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
