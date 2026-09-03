import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { subscribeSchoolData, saveSchoolData } from "../firebase/schoolData";
import { DEFAULT_DATA } from "../utils/helpers";

const SchoolDataContext = createContext(null);

export function SchoolDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeSchoolData(
      (remote) => {
        setData(remote || DEFAULT_DATA);
        setLoading(false);
      },
      () => {
        setData(DEFAULT_DATA);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const persist = useCallback(async (next) => {
    setData(next);
    try {
      await saveSchoolData(next);
      setSaveError("");
    } catch (e) {
      setSaveError("Save nahi ho saka — Firebase config ya Firestore rules check karein.");
    }
  }, []);

  return (
    <SchoolDataContext.Provider value={{ data, loading, persist, saveError }}>
      {children}
    </SchoolDataContext.Provider>
  );
}

export function useSchoolData() {
  return useContext(SchoolDataContext);
}
