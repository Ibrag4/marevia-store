import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
const KEY = "marevia-theme";

// O script do index.html já aplica o tema antes da pintura (sem piscar); aqui só lemos o resultado
const initialTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(
  null
);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // Cor da barra do navegador no celular
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#161412" : "#f7f1e7");
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Sem armazenamento (aba anônima): vale só nesta visita
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeContext);
  if (!v) throw new Error("useTheme precisa estar dentro de ThemeProvider");
  return v;
}
