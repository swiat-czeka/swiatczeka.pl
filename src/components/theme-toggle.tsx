'use client';

import { Moon, Sun } from 'lucide-react';

/** Przełącza jasny/ciemny motyw i zapamiętuje wybór; bez wyboru obowiązuje ustawienie systemu. */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* prywatne okno — motyw działa do końca sesji */ }
  }
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Przełącz jasny / ciemny motyw" title="Jasny / ciemny motyw">
      <Sun className="icon-sun" size={20} />
      <Moon className="icon-moon" size={20} />
    </button>
  );
}
