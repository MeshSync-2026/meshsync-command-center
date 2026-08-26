// User preferences context
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { DISTRICTS } from "../data/mockData";

const PrefsContext = createContext(null);
const LS_PREFS = "meshsync.prefs";

const DEFAULT_PREFS = {
  defaultDistrict: "all",
  alertThreshold: "high",
  autoRefresh: true,
  muleTimeout: 30,
  mapLayer: "dark",
};


function loadPrefs() {
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
  }
  return { ...DEFAULT_PREFS };
}

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [activeDistrict, setActiveDistrict] = useState(prefs.defaultDistrict || "all");

  const updatePref = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(LS_PREFS, JSON.stringify(next));
      return next;
    });
  }, []);

  const changeDistrict = useCallback(
    (district) => {
      setActiveDistrict(district);
    },
    []
  );

  const districtCoords = useMemo(() => {
    if (activeDistrict === "all") return null;
    return DISTRICTS.find((d) => d.name === activeDistrict) || null;
  }, [activeDistrict]);


  const value = useMemo(
    () => ({
      ...prefs,
      updatePref,
      activeDistrict,
      changeDistrict,
      districtCoords,
      districts: DISTRICTS,
    }),
    [prefs, updatePref, activeDistrict, changeDistrict, districtCoords]
  );

  return (
    <PrefsContext.Provider value={value}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}
