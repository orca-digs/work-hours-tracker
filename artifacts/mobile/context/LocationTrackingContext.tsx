import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { useWorkHours } from "./WorkHoursContext";

interface LocationTrackingState {
  currentLocation: Location.LocationObject | null;
  permissionStatus: "undetermined" | "granted" | "denied";
  isTracking: boolean;
  nearbyLocationId: string | null;
  requestPermission: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
}

const LocationTrackingContext = createContext<LocationTrackingState | null>(
  null
);

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function LocationTrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "undetermined" | "granted" | "denied"
  >("undetermined");
  const [isTracking, setIsTracking] = useState(false);
  const [nearbyLocationId, setNearbyLocationId] = useState<string | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const { locations, activeSession, clockIn, clockOut } = useWorkHours();
  const prevNearbyRef = useRef<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (permissionStatus === "granted") {
      startTracking();
    }
    return () => stopTracking();
  }, [permissionStatus]);

  useEffect(() => {
    if (!currentLocation) return;
    const { latitude, longitude } = currentLocation.coords;

    let closest: string | null = null;
    let closestDist = Infinity;

    for (const loc of locations) {
      const dist = getDistance(latitude, longitude, loc.latitude, loc.longitude);
      if (dist <= loc.radius && dist < closestDist) {
        closest = loc.id;
        closestDist = dist;
      }
    }

    setNearbyLocationId(closest);

    if (closest !== prevNearbyRef.current) {
      if (closest && !activeSession) {
        clockIn(closest, false);
      } else if (!closest && activeSession && !activeSession.isManual) {
        clockOut();
      }
      prevNearbyRef.current = closest;
    }
  }, [currentLocation, locations, activeSession]);

  async function checkPermission() {
    if (Platform.OS === "web") {
      setPermissionStatus("undetermined");
      return;
    }
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(
      status === "granted"
        ? "granted"
        : status === "denied"
        ? "denied"
        : "undetermined"
    );
  }

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") {
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => reject()
          );
        });
        setPermissionStatus("granted");
      } catch {
        setPermissionStatus("denied");
      }
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(
      status === "granted"
        ? "granted"
        : status === "denied"
        ? "denied"
        : "undetermined"
    );
  }, []);

  const startTracking = useCallback(async () => {
    if (isTracking) return;
    if (Platform.OS === "web") {
      if (!navigator.geolocation) return;
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentLocation({
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              altitude: null,
              accuracy: pos.coords.accuracy,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: pos.timestamp,
          } as Location.LocationObject);
        },
        undefined,
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );
      (watchRef as any).current = { webId: watchId };
      setIsTracking(true);
      return;
    }
    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000,
          distanceInterval: 20,
        },
        (loc) => {
          setCurrentLocation(loc);
        }
      );
      watchRef.current = sub;
      setIsTracking(true);
    } catch (_) {}
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      if ((watchRef.current as any).webId !== undefined) {
        navigator.geolocation.clearWatch((watchRef.current as any).webId);
      } else {
        watchRef.current.remove();
      }
      watchRef.current = null;
    }
    setIsTracking(false);
  }, []);

  return (
    <LocationTrackingContext.Provider
      value={{
        currentLocation,
        permissionStatus,
        isTracking,
        nearbyLocationId,
        requestPermission,
        startTracking,
        stopTracking,
      }}
    >
      {children}
    </LocationTrackingContext.Provider>
  );
}

export function useLocationTracking() {
  const ctx = useContext(LocationTrackingContext);
  if (!ctx)
    throw new Error(
      "useLocationTracking must be used within LocationTrackingProvider"
    );
  return ctx;
}
