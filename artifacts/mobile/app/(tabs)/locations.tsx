import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddLocationModal } from "@/components/AddLocationModal";
import { LocationCard } from "@/components/LocationCard";
import { useWorkHours } from "@/context/WorkHoursContext";
import { useLocationTracking } from "@/context/LocationTrackingContext";
import { useColors } from "@/hooks/useColors";

export default function LocationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    locations,
    removeLocation,
    clockIn,
    activeSession,
    defaultRadius,
    addLocation,
  } = useWorkHours();
  const { nearbyLocationId } = useLocationTracking();
  const [showAdd, setShowAdd] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Work Locations
        </Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAdd(true);
          }}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={locations}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => (
          <LocationCard
            location={item}
            isNearby={nearbyLocationId === item.id}
            onDelete={removeLocation}
            onClockIn={(id) => clockIn(id, true)}
            isActive={!!activeSession}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: botPad + 80 },
        ]}
        scrollEnabled={!!locations.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="map-pin" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No locations added
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add your work locations to enable automatic clock in/out when you arrive or leave.
            </Text>
            <TouchableOpacity
              onPress={() => setShowAdd(true)}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyBtnText}>Add Location</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <AddLocationModal
        visible={showAdd}
        defaultRadius={defaultRadius}
        onClose={() => setShowAdd(false)}
        onAdd={addLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
