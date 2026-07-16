const TAG_COLORS = [
  { bg: '#fef3e5', color: '#b45309', border: '#f59e0b' },
  { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  { bg: '#f0fdfa', color: '#0f766e', border: '#5eead4' },
  { bg: '#eef2ff', color: '#4338ca', border: '#a5b4fc' },
  { bg: '#fff1f2', color: '#be123c', border: '#fda4af' },
  { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' },
]

export function useTagColor(tag: string) {
  return TAG_COLORS[(tag.charCodeAt(0) + tag.length) % TAG_COLORS.length]!
}
