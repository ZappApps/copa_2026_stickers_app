import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useCollection } from "@/hooks/use-collection";
import { useColors } from "@/hooks/use-colors";

function ProgressRing({ percent, size = 120 }: { percent: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Background ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 8,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      />
      {/* Progress arc approximation using a colored ring */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 8,
          borderColor: "#FFD700",
          borderTopColor: percent > 25 ? "#FFD700" : "transparent",
          borderRightColor: percent > 50 ? "#FFD700" : "transparent",
          borderBottomColor: percent > 75 ? "#FFD700" : "transparent",
          borderLeftColor: percent > 0 ? "#FFD700" : "transparent",
          transform: [{ rotate: "-90deg" }],
        }}
      />
      <Text style={{ color: "#FFD700", fontSize: 24, fontWeight: "900" }}>{percent}%</Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  onPress,
}: {
  label: string;
  value: number | string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginHorizontal: 4,
      }}
      activeOpacity={0.7}
    >
      <Text style={{ color, fontSize: 28, fontWeight: "900" }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4, textAlign: "center" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { stats, loading } = useCollection();

  return (
    <ScreenContainer containerClassName="bg-primary" className="">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: "#00843D", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}>
          <Text style={{ color: "#FFD700", fontSize: 13, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase" }}>
            🏆 FIFA World Cup 2026
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "900", marginTop: 4 }}>
            Meu Álbum
          </Text>

          {/* Progress Ring + Stats */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, gap: 16 }}>
            {loading ? (
              <ActivityIndicator color="#FFD700" size="large" />
            ) : (
              <ProgressRing percent={stats.completionPercent} size={110} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 36, fontWeight: "900" }}>
                {stats.owned}
                <Text style={{ fontSize: 18, fontWeight: "400", color: "rgba(255,255,255,0.7)" }}>
                  /{stats.total}
                </Text>
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 }}>
                figurinhas coladas
              </Text>
            </View>
          </View>

          {/* Stat Cards */}
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <StatCard
              label="Faltantes"
              value={stats.missing}
              color="#FF6B6B"
              onPress={() => router.push("/album?filter=missing")}
            />
            <StatCard
              label="Repetidas"
              value={stats.duplicates}
              color="#FFD700"
              onPress={() => router.push("/album?filter=duplicate")}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ backgroundColor: "#F5F5F5", flex: 1, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 }}>
            O que deseja fazer?
          </Text>

          {/* Add Stickers */}
          <TouchableOpacity
            onPress={() => router.push("/add")}
            style={{
              backgroundColor: "#00843D",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 32 }}>📸</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}>
                Adicionar Figurinhas
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 2 }}>
                Por foto, texto ou arquivo
              </Text>
            </View>
            <Text style={{ color: "#FFD700", fontSize: 20 }}>›</Text>
          </TouchableOpacity>

          {/* Compare Lists */}
          <TouchableOpacity
            onPress={() => router.push("/compare")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              borderWidth: 2,
              borderColor: "#00843D",
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 32 }}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#00843D", fontSize: 17, fontWeight: "800" }}>
                Comparar com Amigo
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                Cole a lista e veja os matches
              </Text>
            </View>
            <Text style={{ color: "#00843D", fontSize: 20 }}>›</Text>
          </TouchableOpacity>

          {/* Reports */}
          <TouchableOpacity
            onPress={() => router.push("/reports")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              borderWidth: 2,
              borderColor: "#E5E7EB",
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 32 }}>📋</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#1A1A1A", fontSize: 17, fontWeight: "800" }}>
                Relatórios
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                Gerar e compartilhar listas
              </Text>
            </View>
            <Text style={{ color: "#6B7280", fontSize: 20 }}>›</Text>
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            onPress={() => router.push("/history")}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              borderWidth: 2,
              borderColor: "#E5E7EB",
            }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 32 }}>📖</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#1A1A1A", fontSize: 17, fontWeight: "800" }}>
                Histórico de Trocas
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                Ver todas as trocas realizadas
              </Text>
            </View>
            <Text style={{ color: "#6B7280", fontSize: 20 }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
