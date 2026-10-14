export const NAV_ORDER_KEY = 'nav_order'

export function sortByOrder(categories, order) {
  if (!Array.isArray(order)) return categories

  const rank = (key) => {
    const index = order.indexOf(key)
    return index === -1 ? order.length : index
  }

  return [...categories].sort((a, b) => rank(a.key) - rank(b.key))
}
