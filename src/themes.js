// The CSS values for each theme live in src/index.css (as [data-theme] blocks).
// This just drives the picker UI + persistence. `bg`/`accent` are swatch previews.
export const THEMES = [
  { id: 'gunmetal', name: 'Gunmetal',     bg: '#181B1F', panel: '#23272C', accent: '#F0531C' },
  { id: 'graphite', name: 'Black & Grey', bg: '#0B0B0C', panel: '#1A1A1C', accent: '#C9CCD1' },
  { id: 'copper',   name: 'Copper',       bg: '#17130F', panel: '#241C15', accent: '#C87A32' },
  { id: 'marine',   name: 'Marine',       bg: '#0E1518', panel: '#16232A', accent: '#3FB6C4' },
]

export const DEFAULT_THEME = 'gunmetal'
const key = me => `g43.theme:${me || 'local'}`

export function loadTheme(me) {
  try { return localStorage.getItem(key(me)) || DEFAULT_THEME } catch { return DEFAULT_THEME }
}

export function applyTheme(id) {
  document.documentElement.dataset.theme = id
}

export function saveTheme(me, id) {
  try { localStorage.setItem(key(me), id) } catch { /* ignore */ }
}
