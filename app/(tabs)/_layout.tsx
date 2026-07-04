import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#00843D",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="album"
        options={{
          title: "Álbum",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📒" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Adicionar",
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Comparar",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔄" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} />,
          href: null,
        }}
      />
    </Tabs>
  );
}
