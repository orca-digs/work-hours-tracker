import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface AddLocationModalProps {
  visible: boolean;
  defaultRadius: number;
  onClose: () => void;
  onAdd: (loc: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }) => void;
}

export function AddLocationModal({
  visible,
  defaultRadius,
  onClose,
  onAdd,
}: AddLocationModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(defaultRadius.toString());
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim()) {
      setError("Please enter a location name");
      return;
    }
    setError(null);
    setGettingLocation(true);
    try {
      let coords: { latitude: number; longitude: number } | null = null;

      if (Platform.OS === "web") {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              }),
            reject,
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      } else {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }

      if (coords) {
        const r = parseInt(radius) || defaultRadius;
        onAdd({ name: name.trim(), ...coords, radius: r });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setName("");
        setRadius(defaultRadius.toString());
        onClose();
      }
    } catch (e) {
      setError("Could not get your location. Please try again.");
    } finally {
      setGettingLocation(false);
    }
  }

  function handleClose() {
    setName("");
    setRadius(defaultRadius.toString());
    setError(null);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.border,
              paddingTop: Platform.OS === "web" ? 24 : 16,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>
            Add Work Location
          </Text>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Your current GPS location will be saved as the geofence center.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Location Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Office, Warehouse, Site B"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Detection Radius (meters)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder="200"
              placeholderTextColor={colors.mutedForeground}
              value={radius}
              onChangeText={setRadius}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>

          {error && (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleAdd}
            disabled={gettingLocation}
            style={[
              styles.addBtn,
              { backgroundColor: colors.primary, opacity: gettingLocation ? 0.7 : 1 },
            ]}
            activeOpacity={0.85}
          >
            {gettingLocation ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addBtnText}>Save Current Location</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  body: {
    padding: 20,
    gap: 20,
  },
  hint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  error: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  addBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
