
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);                               //creates a empty global shared box   

export const THEMES = [                                           //these is nothing but array of objects
  { id: "bloom",    label: "Bloom",    icon: "✦" },
  { id: "midnight", label: "Midnight", icon: "🌙" },
];
export function ThemeProvider({ children }) {                 //function called from main.jsx  
  const [theme, setThemeState] = useState(                     //creates state , the precvious selected state from localstorage , if no exist then set to light bloom
    () => localStorage.getItem("gwi-theme") || "bloom"
  );
  
document.documentElement.setAttribute(                              //change all the attributes of css
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