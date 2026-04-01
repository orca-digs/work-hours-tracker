import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { WorkLocation } from "@/context/WorkHoursContext";

interface LocationCardProps {
  location: WorkLocation;
  isNearby: boolean;
  onDelete: (id: string) => void;
  onClockIn: (id: string) => void;
  isActive: boolean;
}

export function LocationCard({
  location,
  isNearby,
  onDelete,
  onClockIn,
  isActive,
}: LocationCardProps) {
  const colors = useColors();

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Remove Location",
      `Remove "${location.name}" from your work locations?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDelete(location.id),
        },
      ]
    );
  };

  const dotColor = isNearby ? colors.clockedIn : colors.mutedForeground;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isNearby ? colors.clockedIn : colors.border,
          borderWidth: isNearby ? 1.5 : 1,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {location.name}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {location.radius}m radius
          {isNearby ? "  •  You are here" : ""}
        </Text>
      </View>
      <View style={styles.actions}>
        {!isActive && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClockIn(location.id);
            }}
            hitSlop={8}
          >
            <Feather name="log-in" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDelete} hitSlop={8}>
          <Feather name="trash-2" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
});
