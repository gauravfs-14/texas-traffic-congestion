"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { CursorTooltip } from "./cursor-tooltip"
import { ChartInteractionHint } from "./chart-interaction-hint"

interface LollipopChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
    [key: string]: any
  }>
  height?: number
  maxValue?: number
  valueFormatter?: (value: number) => string
  tooltipFormatter?: (item: any) => React.ReactNode
  onItemClick?: (item: any) => void
  className?: string
  animate?: boolean
  labelWidth?: number
  interactionHint?: string
}

export function LollipopChart({
  data,
  height = 400,
  maxValue,
  valueFormatter = (value) => value.toLocaleString(),
  tooltipFormatter,
  onItemClick,
  className = "",
  animate = true,
  labelWidth = 120,
  interactionHint,
}: LollipopChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Calculate the maximum value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.map((item) => item.value)) * 1.1

  // Chart dimensions
  const chartWidth = `calc(100% - ${labelWidth}px)`
  const lineY = height - 40 // Position of the horizontal line

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: `${height}px` }}
      ref={chartRef}
      onMouseMove={handleInteraction}
    >
      {interactionHint && !hasInteracted && <ChartInteractionHint message={interactionHint} position="top-right" />}

      {/* Y-axis labels */}
      <div
        className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 font-mono"
        style={{ width: `${labelWidth}px` }}
      >
        {data.map((item, index) => (
          <div
            key={`label-${index}`}
            className="truncate pr-2 text-right"
            style={{
              position: "absolute",
              top: `${(index * (lineY - 20)) / data.length + 10}px`,
              width: `${labelWidth - 10}px`,
            }}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="absolute right-0 top-0 bottom-0" style={{ width: chartWidth }}>
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((tick) => (
          <div
            key={`grid-${tick}`}
            className="absolute border-t border-gray-200 dark:border-gray-800 w-full"
            style={{ top: `${lineY - lineY * tick}px` }}
          >
            <span className="absolute right-0 -top-3 text-xs text-gray-500 font-mono">
              {valueFormatter(calculatedMaxValue * tick)}
            </span>
          </div>
        ))}

        {/* Horizontal axis line */}
        <div className="absolute border-t border-gray-300 dark:border-gray-700 w-full" style={{ top: `${lineY}px` }} />

        {/* Data points */}
        {data.map((item, index) => {
          const itemY = (index * (lineY - 20)) / data.length + 10
          // Ensure lineWidth is always a valid number
          const lineWidth = isNaN(item.value / calculatedMaxValue)
            ? 0
            : (item.value / calculatedMaxValue) * (Number.parseInt(chartWidth) - 40)
          const isHovered = hoveredIndex === index

          return (
            <CursorTooltip
              key={`item-${index}`}
              content={
                tooltipFormatter ? (
                  tooltipFormatter(item)
                ) : (
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div>{valueFormatter(item.value)}</div>
                    {onItemClick && <div className="text-xs text-blue-500 mt-1">Click for details</div>}
                  </div>
                )
              }
            >
              <div
                className="absolute flex items-center cursor-pointer"
                style={{ top: `${itemY}px`, left: 0 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onItemClick && onItemClick(item)}
              >
                {/* Line */}
                <motion.div
                  initial={animate ? { width: 0 } : { width: lineWidth }}
                  animate={{ width: lineWidth }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className="h-[2px] origin-left"
                  style={{
                    backgroundColor: item.color || "#3b82f6",
                    opacity: isHovered ? 1 : 0.7,
                  }}
                />

                {/* Circle */}
                <motion.div
                  initial={animate ? { scale: 0 } : { scale: 1 }}
                  animate={{
                    scale: 1,
                    width: isHovered ? 14 : 10,
                    height: isHovered ? 14 : 10,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: animate ? index * 0.1 + 0.8 : 0,
                    ease: "easeOut",
                  }}
                  className="rounded-full absolute"
                  style={{
                    backgroundColor: item.color || "#3b82f6",
                    left: isNaN(lineWidth) ? 0 : lineWidth,
                    transform: "translate(-50%, -50%)",
                    boxShadow: isHovered ? "0 0 0 4px rgba(59, 130, 246, 0.2)" : "none",
                  }}
                />
              </div>
            </CursorTooltip>
          )
        })}
      </div>
    </div>
  )
}
