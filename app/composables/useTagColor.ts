const TAG_COLORS = [
  { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }, // amber
  { bg: '#fee2e2', color: '#991b1b', border: '#f87171' }, // red
  { bg: '#d1fae5', color: '#065f46', border: '#34d399' }, // emerald
  { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' }, // blue
  { bg: '#ffedd5', color: '#9a3412', border: '#fb923c' }, // orange
  { bg: '#f3e8ff', color: '#6b21a8', border: '#c084fc' }, // purple
]

export function useTagColor(tag: string) {
  return TAG_COLORS[(tag.charCodeAt(0) + tag.length) % TAG_COLORS.length]!
}
