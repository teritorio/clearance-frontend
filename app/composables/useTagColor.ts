const TAG_COLORS = [
  { bg: '#f7fee7', color: '#3f6212', border: '#84cc16' }, // lime
  { bg: '#fee2e2', color: '#991b1b', border: '#f87171' }, // red
  { bg: '#ffedd5', color: '#9a3412', border: '#fb923c' }, // orange
  { bg: '#fce7f3', color: '#9d174d', border: '#f472b6' }, // rose
  { bg: '#f3e8ff', color: '#6b21a8', border: '#c084fc' }, // purple
  { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }, // amber
  { bg: '#f0fdfa', color: '#134e4a', border: '#2dd4bf' }, // teal
  { bg: '#eff6ff', color: '#1e3a8a', border: '#60a5fa' }, // blue
]

export function useTagColor(tag: string) {
  const hash = [...tag].reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0)
  return TAG_COLORS[hash % TAG_COLORS.length]!
}
