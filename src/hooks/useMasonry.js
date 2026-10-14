import { useLayoutEffect, useRef } from 'react'

// Grid uses 1px implicit rows; each child spans as many rows as its own height,
// so shorter blocks let the next block slide up into the gap.
export function useMasonry(dependency) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const place = (item) => {
      const marginBottom = parseFloat(getComputedStyle(item).marginBottom) || 0
      const height = item.getBoundingClientRect().height + marginBottom
      item.style.gridRowEnd = `span ${Math.ceil(height)}`
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => place(entry.target))
    })

    Array.from(container.children).forEach((item) => {
      place(item)
      observer.observe(item)
    })

    return () => observer.disconnect()
  }, [dependency])

  return containerRef
}
