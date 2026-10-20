import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Alterna entre modo claro e escuro em todo o site
export default function ThemeToggle({
  className = "icon-button theme-toggle",
}: {
  className?: string;
}) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Ativar modo claro" : "Ativar modo escuro";
  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {dark ? <Sun /> : <Moon />}
    </button>
  );
}
