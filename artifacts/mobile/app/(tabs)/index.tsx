import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClockButton } from "@/components/ClockButton";
import { DurationDisplay } from "@/components/DurationDisplay";
import { StatCard } from "@/components/StatCard";
import { AddLocationModal } from "@/components/AddLocationModal";
import { useWorkHours } from "@/context/WorkHoursContext";
import { useLocationTracking } from "@/context/LocationTrackingContext";
import { useColors } from "@/hooks/useColors";

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    locations,
    activeSession,
    clockIn,
    clockOut,
    getTodayMinutes,
    getWeekMinutes,
    defaultRadius,
    addLocation,
  } = useWorkHours();
  const { permissionStatus, requestPermission, nearbyLocationId } =
    useLocationTracking();
  const [showAddModal, setShowAddModal] = useState(false);

  const todayMinutes = getTodayMinutes();
  const weekMinutes = getWeekMinutes();

  function handleClockToggle() {
    if (activeSession) {
      clockOut();
    } else {
      if (locations.length === 0) {
        setShowAddModal(true);
        return;
      }
      const targetId = nearbyLocationId || locations[0].id;
      clockIn(targetId, true);
    }
  }

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
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Work Hours
          </Text>
        </View>
      </View>

      {permissionStatus !== "granted" && (
        <TouchableOpacity
          onPress={requestPermission}
          style={[
            styles.permissionBanner,
            { backgroundColor: colors.secondary },
          ]}
          activeOpacity={0.8}
        >
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.permissionText, { color: colors.secondaryForeground ?? colors.foreground }]}>
            Enable location for automatic tracking
          </Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}

      <View style={styles.clockSection}>
        {activeSession && (
          <>
            <DurationDisplay clockInTime={activeSession.clockIn} size="large" />
            <Text style={[styles.clockedAtLabel, { color: colors.mutedForeground }]}>
              at {activeSession.locationName}
            </Text>
          </>
        )}
        {!activeSession && (
          <Text style={[styles.idleLabel, { color: colors.mutedForeground }]}>
            Not clocked in
          </Text>
        )}

        <ClockButton
          onPress={handleClockToggle}
          isClockedIn={!!activeSession}
        />

        {!activeSession && locations.length > 0 && nearbyLocationId && (
          <Text style={[styles.nearbyHint, { color: colors.accent }]}>
            <Feather name="map-pin" size={12} color={colors.accent} />
            {"  "}Detected: {locations.find((l) => l.id === nearbyLocationId)?.name}
          </Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Today" value={formatMinutes(todayMinutes)} />
        <StatCard label="This Week" value={formatMinutes(weekMinutes)} accent />
      </View>

      {locations.length === 0 && (
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={[
            styles.addFirstLocation,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.8}
        >
          <Feather name="plus-circle" size={24} color={colors.primary} />
          <View style={styles.addFirstText}>
            <Text style={[styles.addFirstTitle, { color: colors.foreground }]}>
              Add your first work location
            </Text>
            <Text
              style={[styles.addFirstSub, { color: colors.mutedForeground }]}
            >
              Clock in/out automatically when you arrive or leave
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <AddLocationModal
        visible={showAddModal}
        defaultRadius={defaultRadius}
        onClose={() => setShowAddModal(false)}
        onAdd={addLocation}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  permissionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  clockSection: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
  },
  idleLabel: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },
  clockedAtLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: -6,
  },
  nearbyHint: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  addFirstLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  addFirstText: {
    flex: 1,
    gap: 4,
  },
  addFirstTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  addFirstSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
