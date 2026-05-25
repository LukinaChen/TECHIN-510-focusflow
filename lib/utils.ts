export function getLevel(points: number): { label: string; icon: string; next: number | null } {
  if (points >= 100) return { label: 'Zen Master', icon: '🌳', next: null }
  if (points >= 50) return { label: 'Focus Warrior', icon: '🌿', next: 100 }
  return { label: 'Beginner', icon: '🌱', next: 50 }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
