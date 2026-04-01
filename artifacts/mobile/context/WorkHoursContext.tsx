import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface WorkLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export interface WorkSession {
  id: string;
  locationId: string;
  locationName: string;
  clockIn: string;
  clockOut: string | null;
  durationMinutes: number | null;
  isManual: boolean;
}

interface WorkHoursState {
  locations: WorkLocation[];
  sessions: WorkSession[];
  activeSession: WorkSession | null;
  isClockingIn: boolean;
  defaultRadius: number;
}

interface WorkHoursContextValue extends WorkHoursState {
  addLocation: (loc: Omit<WorkLocation, "id">) => void;
  removeLocation: (id: string) => void;
  updateLocation: (id: string, updates: Partial<WorkLocation>) => void;
  clockIn: (locationId: string, isManual?: boolean) => void;
  clockOut: () => void;
  deleteSession: (id: string) => void;
  setDefaultRadius: (r: number) => void;
  getTodayMinutes: () => number;
  getWeekMinutes: () => number;
}

const WorkHoursContext = createContext<WorkHoursContextValue | null>(null);

const STORAGE_KEY = "work_hours_data";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function WorkHoursProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [defaultRadius, setDefaultRadiusState] = useState(200);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loaded) saveData();
  }, [locations, sessions, activeSession, defaultRadius, loaded]);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        setActiveSession((prev) => (prev ? { ...prev } : null));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession?.id]);

  async function loadData() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setLocations(data.locations || []);
        setSessions(data.sessions || []);
        setActiveSession(data.activeSession || null);
        setDefaultRadiusState(data.defaultRadius || 200);
      }
    } catch (_) {}
    setLoaded(true);
  }

  async function saveData() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ locations, sessions, activeSession, defaultRadius })
      );
    } catch (_) {}
  }

  const addLocation = useCallback(
    (loc: Omit<WorkLocation, "id">) => {
      const newLoc: WorkLocation = { ...loc, id: generateId() };
      setLocations((prev) => [...prev, newLoc]);
    },
    []
  );

  const removeLocation = useCallback((id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLocation = useCallback(
    (id: string, updates: Partial<WorkLocation>) => {
      setLocations((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
    },
    []
  );

  const clockIn = useCallback(
    (locationId: string, isManual = false) => {
      if (activeSession) return;
      const loc = locations.find((l) => l.id === locationId);
      if (!loc) return;
      setIsClockingIn(true);
      const session: WorkSession = {
        id: generateId(),
        locationId,
        locationName: loc.name,
        clockIn: new Date().toISOString(),
        clockOut: null,
        durationMinutes: null,
        isManual,
      };
      setActiveSession(session);
      setIsClockingIn(false);
    },
    [activeSession, locations]
  );

  const clockOut = useCallback(() => {
    if (!activeSession) return;
    const now = new Date();
    const start = new Date(activeSession.clockIn);
    const durationMinutes = Math.round(
      (now.getTime() - start.getTime()) / 60000
    );
    const completed: WorkSession = {
      ...activeSession,
      clockOut: now.toISOString(),
      durationMinutes,
    };
    setSessions((prev) => [completed, ...prev]);
    setActiveSession(null);
  }, [activeSession]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const setDefaultRadius = useCallback((r: number) => {
    setDefaultRadiusState(r);
  }, []);

  const getTodayMinutes = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => {
        const d = new Date(s.clockIn);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime() && s.durationMinutes !== null;
      })
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions]);

  const getWeekMinutes = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => {
        const d = new Date(s.clockIn);
        return d >= startOfWeek && s.durationMinutes !== null;
      })
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions]);

  return (
    <WorkHoursContext.Provider
      value={{
        locations,
        sessions,
        activeSession,
        isClockingIn,
        defaultRadius,
        addLocation,
        removeLocation,
        updateLocation,
        clockIn,
        clockOut,
        deleteSession,
        setDefaultRadius,
        getTodayMinutes,
        getWeekMinutes,
      }}
    >
      {children}
    </WorkHoursContext.Provider>
  );
}

export function useWorkHours() {
  const ctx = useContext(WorkHoursContext);
  if (!ctx) throw new Error("useWorkHours must be used within WorkHoursProvider");
  return ctx;
}
