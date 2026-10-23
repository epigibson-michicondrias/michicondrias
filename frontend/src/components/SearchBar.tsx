"use client";

/** Búsqueda con botón de borrar (espejo de `mobile/src/components/SearchBar.tsx`). */
import { Search, X } from "lucide-react";
import s from "./kit.module.css";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Modo acceso: se ve igual pero solo abre otra pantalla de búsqueda. */
  onPress?: () => void;
}

export default function SearchBar({ value = "", onChangeText, placeholder, onPress }: SearchBarProps) {
  const text = placeholder || "Buscar…";
  if (onPress) {
    return (
      <button type="button" className={s.search} onClick={onPress} aria-label={placeholder || "Buscar"}>
        <Search size={16} strokeWidth={2} aria-hidden />
        <span>{text}</span>
      </button>
    );
  }
  return (
    <label className={s.search}>
      <Search size={16} strokeWidth={2} aria-hidden />
      <input
        type="search"
        className={s.searchInput}
        value={value}
        onChange={(e) => onChangeText?.(e.target.value)}
        placeholder={text}
        aria-label={placeholder || "Buscar"}
        autoComplete="off"
      />
      {value.length > 0 ? (
        <button type="button" className={s.link} onClick={() => onChangeText?.("")} aria-label="Borrar búsqueda">
          <X size={16} />
        </button>
      ) : null}
    </label>
  );
}
