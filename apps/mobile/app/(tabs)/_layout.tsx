import { Tabs } from "expo-router";
import { Text } from "react-native";

type TabIconProps = { focused: boolean; label: string; icon: string };

function TabIcon({ focused, label, icon }: TabIconProps) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
      {icon}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopColor: "#FED7AA",
          borderTopWidth: 2,
          height: 70,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12,
        },
        headerStyle: { backgroundColor: "#F97316" },
        headerTitleStyle: { color: "white", fontWeight: "900", fontSize: 20 },
        headerTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Schreibfix 🦊",
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Home" icon="🦊" />
          ),
        }}
      />
      <Tabs.Screen
        name="diktat"
        options={{
          title: "Diktat",
          tabBarLabel: "Diktat",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Diktat" icon="🎙️" />
          ),
        }}
      />
      <Tabs.Screen
        name="uebungen"
        options={{
          title: "Übungen",
          tabBarLabel: "Übungen",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Übungen" icon="✏️" />
          ),
        }}
      />
      <Tabs.Screen
        name="fortschritt"
        options={{
          title: "Fortschritt",
          tabBarLabel: "Fortschritt",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Fortschritt" icon="⭐" />
          ),
        }}
      />
    </Tabs>
  );
}
