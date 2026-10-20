import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light";

const ThemeContext = createContext<{ theme: Theme } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.dataset.theme = "light";
    // Cor da barra do navegador no celular
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#f7f1e7");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (!v) throw new Error("useTheme precisa estar dentro de ThemeProvider");
  return v;
}
