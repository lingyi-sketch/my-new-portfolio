export const WEEK_ORDER_KEY = 'assignment_week_order'

export function orderWeeks(weeks, saved) {
  const base = [...new Set(weeks)].sort((a, b) => a - b)
  if (!Array.isArray(saved)) return base

  const rank = (week) => {
    const index = saved.indexOf(week)
    return index === -1 ? Infinity : index
  }

  return base.sort((a, b) => {
    const rankA = rank(a)
    const rankB = rank(b)
    return rankA === rankB ? a - b : rankA - rankB
  })
}
