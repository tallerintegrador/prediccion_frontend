import { useEffect, useRef, useState, type ReactNode } from 'react'

type ChartSize = {
  width: number
  height: number
}

type ChartFrameProps = {
  children: (size: ChartSize) => ReactNode
  height?: number
}

export function ChartFrame({ children, height = 288 }: ChartFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<ChartSize>({ width: 0, height })

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const updateSize = (width: number, measuredHeight: number) => {
      setSize({
        width: Math.max(0, Math.floor(width)),
        height: Math.max(height, Math.floor(measuredHeight || height)),
      })
    }

    const rect = element.getBoundingClientRect()
    updateSize(rect.width, rect.height)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }
      updateSize(entry.contentRect.width, entry.contentRect.height)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [height])

  return (
    <div ref={containerRef} className="min-w-0 w-full" style={{ height, minHeight: height }}>
      {size.width > 0 ? children(size) : null}
    </div>
  )
}