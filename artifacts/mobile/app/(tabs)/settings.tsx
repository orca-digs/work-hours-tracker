import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkHours } from "@/context/WorkHoursContext";
import { useLocationTracking } from "@/context/LocationTrackingContext";
import { useColors } from "@/hooks/useColors";

const RADIUS_OPTIONS = [50, 100, 200, 500, 1000];

function SettingRow({
  label,
  value,
  icon,
  onPress,
  danger,
}: {
  label: string;
  value?: string;
  icon: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Feather
        name={icon as any}
        size={18}
        color={danger ? colors.destructive : colors.primary}
      />
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
          {value}
        </Text>
      )}
      {onPress && !danger && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { defaultRadius, setDefaultRadius } = useWorkHours();
  const { permissionStatus, requestPermission } = useLocationTracking();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: botPad + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Location
        </Text>
        <View style={styles.sectionContent}>
          <SettingRow
            icon="map-pin"
            label="Location Permission"
            value={
              permissionStatus === "granted"
                ? "Granted"
                : permissionStatus === "denied"
                ? "Denied"
                : "Not set"
            }
            onPress={
              permissionStatus !== "granted" ? requestPermission : undefined
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Default Detection Radius
        </Text>
        <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
          How close you need to be to a work location to trigger automatic clock in/out.
        </Text>
        <View style={styles.radiusOptions}>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setDefaultRadius(r)}
              style={[
                styles.radiusChip,
                {
                  backgroundColor:
                    defaultRadius === r ? colors.primary : colors.card,
                  borderColor:
                    defaultRadius === r ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.radiusChipText,
                  {
                    color:
                      defaultRadius === r ? "#fff" : colors.foreground,
                  },
                ]}
              >
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          About
        </Text>
        <View style={styles.sectionContent}>
          <SettingRow icon="info" label="Version" value="1.0.0" />
          <SettingRow
            icon="clock"
            label="Tracking Mode"
            value="GPS Geofence"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 24 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: -4,
  },
  sectionContent: {
    gap: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  radiusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  radiusChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
  },
  radiusChipText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
