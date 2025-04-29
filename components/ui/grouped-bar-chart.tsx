"use client"

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { CursorTooltip } from "./cursor-tooltip"
import { ChartInteractionHint } from "./chart-interaction-hint"

interface GroupedBarChartProps {
  data: Array<{
    category: string
    values: Array<{
      name: string
      value: number
      color?: string
    }>
    [key: string]: any
  }>
  height?: number
  maxValue?: number
  valueFormatter?: (value: number) => string
  tooltipFormatter?: (item: any, value: any) => React.ReactNode
  onBarClick?: (category: string, value: any) => void
  className?: string
  animate?: boolean
  categoryWidth?: number
  interactionHint?: string
}

export function GroupedBarChart({
  data,
  height = 400,
  maxValue,
  valueFormatter = (value) => value.toLocaleString(),
  tooltipFormatter,
  onBarClick,
  className = "",
  animate = true,
  categoryWidth: categoryWidthProp = 100,
  interactionHint,
}: GroupedBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{ category: string; name: string } | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // Find the maximum number of values in any category
  const maxValuesCount = Math.max(...data.map((item) => item.values.length))

  // Calculate the maximum value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.flatMap((item) => item.values.map((v) => v.value))) * 1.1

  // Chart dimensions
  const chartWidth = `calc(100% - ${categoryWidthProp}px)`
  const barAreaHeight = height - 80 // Increased from 60 to 80 to make more room for labels

  // Calculate bar dimensions
  const categorySpacing = 0.2
  const barSpacing = 0.1
  const categoryWidth = (barAreaHeight / data.length) * (1 - categorySpacing)
  const barWidth = (categoryWidth / maxValuesCount) * (1 - barSpacing)

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
        className="absolute left-0 top-0 bottom-[40px] flex flex-col justify-between text-xs text-gray-500 font-mono"
        style={{ width: `${categoryWidthProp}px` }}
      >
        {data.map((item, index) => (
          <div
            key={`label-${index}`}
            className="truncate pr-2 text-right"
            style={{
              position: "absolute",
              top: `${(index * barAreaHeight) / data.length + categoryWidth / 2}px`,
              width: `${categoryWidthProp - 10}px`,
            }}
          >
            {item.category}
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="absolute right-0 top-0 bottom-0" style={{ width: chartWidth }}>
        {/* Vertical grid lines */}
        {[0.25, 0.5, 0.75, 1].map((tick) => (
          <div
            key={`grid-${tick}`}
            className="absolute border-l border-gray-200 dark:border-gray-800 h-full"
            style={{ left: `${tick * 100}%`, bottom: 40 }}
          >
            <span className="absolute left-0 bottom-[-30px] text-xs text-gray-500 font-mono transform -translate-x-1/2">
              {valueFormatter(calculatedMaxValue * tick)}
            </span>
          </div>
        ))}

        {/* Horizontal axis line */}
        <div className="absolute border-t border-gray-300 dark:border-gray-700 w-full" style={{ bottom: "40px" }} />

        {/* Data bars */}
        {data.map((category, categoryIndex) => {
          // Calculate the vertical position for this category
          const categoryTop =
            (categoryIndex * barAreaHeight) / data.length + (categorySpacing * barAreaHeight) / (2 * data.length)

          return (
            <React.Fragment key={`category-${categoryIndex}`}>
              {category.values.map((value, valueIndex) => {
                // Ensure barLength is always a valid number and has a minimum visible size if value > 0
                const percentage = (value.value / calculatedMaxValue) * 100
                const barLength = isNaN(percentage) ? "0%" : percentage < 1 && value.value > 0 ? "1%" : percentage + "%"

                // Calculate the vertical position for this bar within its category
                const barTop = categoryTop + valueIndex * (categoryWidth / maxValuesCount)
                const actualBarHeight = (categoryWidth / maxValuesCount) * 0.7 // Make bars slightly thinner than the space allocated

                const isHovered = hoveredBar?.category === category.category && hoveredBar?.name === value.name

                return (
                  <CursorTooltip
                    key={`bar-${categoryIndex}-${valueIndex}`}
                    content={
                      tooltipFormatter ? (
                        tooltipFormatter(category, value)
                      ) : (
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div>
                            {value.name}: {valueFormatter(value.value)}
                            {value.actualValue !== undefined && ` (${value.actualValue})`}
                          </div>
                          {onBarClick && <div className="text-xs text-blue-500 mt-1">Click for details</div>}
                        </div>
                      )
                    }
                  >
                    <div
                      className="absolute cursor-pointer"
                      style={{
                        top: barTop,
                        left: 0,
                        height: actualBarHeight,
                        width: "100%",
                      }}
                      onMouseEnter={() => setHoveredBar({ category: category.category, name: value.name })}
                      onMouseLeave={() => setHoveredBar(null)}
                      onClick={() => onBarClick && onBarClick(category.category, value)}
                    >
                      <motion.div
                        initial={animate ? { width: 0 } : { width: barLength }}
                        animate={{ width: barLength }}
                        transition={{ duration: 1, delay: categoryIndex * 0.1 + valueIndex * 0.05, ease: "easeOut" }}
                        className="h-full rounded-r-sm"
                        style={{
                          backgroundColor: value.color || "#3b82f6",
                          opacity: isHovered ? 1 : 0.8,
                          boxShadow: isHovered ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
                          minWidth: value.value > 0 ? "4px" : "0px", // Ensure bars with small values are still visible
                        }}
                      />

                      {/* Value label */}
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 text-xs font-medium"
                        style={{
                          left: `calc(${barLength} + 8px)`,
                          opacity: isHovered ? 1 : 0.7,
                        }}
                      >
                        {valueFormatter(value.value)}
                      </div>
                    </div>
                  </CursorTooltip>
                )
              })}

              {/* Series labels at the bottom */}
              {categoryIndex === 0 && (
                <div className="absolute bottom-[-40px] left-0 right-0 flex justify-around">
                  {category.values.map((value, valueIndex) => (
                    <div key={`label-${valueIndex}`} className="text-xs text-gray-500 px-2 text-center">
                      {value.name}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
