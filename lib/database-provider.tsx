import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Platform } from "react-native";
import { getDatabase } from "@/lib/database";

interface DatabaseContextValue {
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({ isReady: false });

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On web, SQLite (WebAssembly) may not be available in all environments.
    // We still try to initialize, but if it fails on web, we show a graceful message.
    getDatabase()
      .then(() => setIsReady(true))
      .catch((e) => {
        console.error("Database init error:", e);
        if (Platform.OS === "web") {
          // On web preview, show a friendly message instead of a crash
          setError("web-unsupported");
        } else {
          setError(String(e));
        }
      });
  }, []);

  if (error === "web-unsupported") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: "#00843D" }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📱</Text>
        <Text style={{ color: "#FFD700", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 12 }}>
          Copa 2026 Figurinhas
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 15, textAlign: "center", lineHeight: 24 }}>
          Este app foi desenvolvido para dispositivos móveis.{"\n\n"}
          Para testar, escaneie o QR Code com o{" "}
          <Text style={{ fontWeight: "800" }}>Expo Go</Text> no seu celular.
        </Text>
        <View style={{ marginTop: 24, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center" }}>
            O banco de dados SQLite não é suportado{"\n"}no preview web do navegador.
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "#C8102E", fontSize: 16, textAlign: "center" }}>
          Erro ao inicializar banco de dados:{"\n"}{error}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00843D" }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚽</Text>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: "#FFD700", marginTop: 16, fontSize: 16, fontWeight: "bold" }}>
          Carregando figurinhas...
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 8, fontSize: 13 }}>
          Copa 2026 · 980 figurinhas
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseReady() {
  return useContext(DatabaseContext).isReady;
}
