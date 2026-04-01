import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface DurationDisplayProps {
  clockInTime: string;
  size?: "large" | "small";
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function DurationDisplay({
  clockInTime,
  size = "large",
}: DurationDisplayProps) {
  const colors = useColors();
  const [elapsed, setElapsed] = useState(
    Date.now() - new Date(clockInTime).getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(clockInTime).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [clockInTime]);

  return (
    <Text
      style={[
        size === "large" ? styles.large : styles.small,
        { color: colors.clockedIn, fontFamily: "Inter_700Bold" },
      ]}
    >
      {formatDuration(elapsed)}
    </Text>
  );
}

const styles = StyleSheet.create({
  large: {
    fontSize: 52,
    letterSpacing: 2,
  },
  small: {
    fontSize: 18,
    letterSpacing: 1,
  },
});
