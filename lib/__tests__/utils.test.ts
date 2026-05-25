import { getLevel, formatDate } from '../utils'

describe('getLevel', () => {
  it('returns Beginner for 0 points', () => {
    const result = getLevel(0)
    expect(result.label).toBe('Beginner')
    expect(result.icon).toBe('🌱')
    expect(result.next).toBe(50)
  })

  it('returns Beginner for 49 points (just below threshold)', () => {
    const result = getLevel(49)
    expect(result.label).toBe('Beginner')
  })

  it('returns Focus Warrior at exactly 50 points', () => {
    const result = getLevel(50)
    expect(result.label).toBe('Focus Warrior')
    expect(result.icon).toBe('🌿')
    expect(result.next).toBe(100)
  })

  it('returns Focus Warrior for 99 points (just below Zen Master)', () => {
    const result = getLevel(99)
    expect(result.label).toBe('Focus Warrior')
  })

  it('returns Zen Master at exactly 100 points', () => {
    const result = getLevel(100)
    expect(result.label).toBe('Zen Master')
    expect(result.icon).toBe('🌳')
    expect(result.next).toBeNull()
  })

  it('returns Zen Master with no next level for very high points', () => {
    const result = getLevel(999)
    expect(result.label).toBe('Zen Master')
    expect(result.next).toBeNull()
  })
})

describe('formatDate', () => {
  it('formats an ISO date string into a readable format', () => {
    const result = formatDate('2026-05-01T14:30:00.000Z')
    expect(result).toMatch(/May/)
    expect(result).toMatch(/1/)
  })

  it('returns a non-empty string for any valid ISO date', () => {
    const result = formatDate('2026-01-15T09:00:00.000Z')
    expect(result.length).toBeGreaterThan(0)
  })
})
