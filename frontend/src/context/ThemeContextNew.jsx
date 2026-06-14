
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  { id: "bloom",    label: "Bloom",    icon: "✦" },
  { id: "midnight", label: "Midnight", icon: "🌙" },
];
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem("gwi-theme") || "bloom"
  );
  
document.documentElement.setAttribute(
  "data-theme",
  localStorage.getItem("gwi-theme") || "bloom"
);

  const setTheme = (id) => {
    localStorage.setItem("gwi-theme", id);
    setThemeState(id);
  };

  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);


  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);