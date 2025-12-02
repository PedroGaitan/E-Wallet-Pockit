import React, { createContext, useContext, useState, ReactNode } from "react";

// Definimos los IDs posibles
export type ThemeId = "dark" | "light" | "red" | "blue";

// Configuración de colores por tema
export const THEMES: Record<ThemeId, { background: string; card: string; text: string; subText: string; border: string }> = {
  dark: { background: "#121212", card: "#1E1E1E", text: "#FFFFFF",subText: "#BDBDBD", border: "#333333" },
  light: { background: "#FFFFFF", card: "#F4F4F4", text: "#121212", subText: "#757575", border: "#E0E0E0" },
  red: { background: "#2B0D0E", card: "#3A1517", text: "#FFFFFF", subText: "#E9A5A7", border: "#880E4F" },
  blue: { background: "#0B1624", card: "#101A26", text: "#FFFFFF",subText: "#9BB7D4", border: "#0B3D91" },
};

// Contexto
type ThemeContextType = {
  themeId: ThemeId;
  theme: typeof THEMES[ThemeId];
  setAppTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeId: "dark",
  theme: THEMES.dark,
  setAppTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeId] = useState<ThemeId>("dark");

  const setAppTheme = (id: ThemeId) => {
    setThemeId(id);
  };

  const theme = THEMES[themeId];

  return (
    <ThemeContext.Provider value={{ themeId, theme, setAppTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook
export const useTheme = () => useContext(ThemeContext);