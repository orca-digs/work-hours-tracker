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
import { WorkSession } from "@/context/WorkHoursContext";

interface SessionCardProps {
  session: WorkSession;
  onDelete: (id: string) => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const colors = useColors();

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(session.id),
      },
    ]);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.row}>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatDate(session.clockIn)}
          </Text>
          {session.isManual && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text
                style={[styles.badgeText, { color: colors.secondaryForeground }]}
              >
                Manual
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.location, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {session.locationName}
        </Text>
        <Text style={[styles.times, { color: colors.mutedForeground }]}>
          {formatTime(session.clockIn)}
          {session.clockOut ? ` — ${formatTime(session.clockOut)}` : " — ongoing"}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.duration, { color: colors.accent }]}>
          {formatDuration(session.durationMinutes)}
        </Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={8}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
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
    borderWidth: 1,
    marginBottom: 10,
  },
  left: {
    flex: 1,
    gap: 3,
  },
  right: {
    alignItems: "flex-end",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  location: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  times: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  duration: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
