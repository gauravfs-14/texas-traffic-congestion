"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { CursorTooltip } from "./cursor-tooltip"
import { ChartInteractionHint } from "./chart-interaction-hint"

interface SimpleBarChartProps {
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
  onBarClick?: (item: any) => void
  className?: string
  animate?: boolean
  layout?: "vertical" | "horizontal"
  labelWidth?: number
  interactionHint?: string
}

export function SimpleBarChart({
  data,
  height = 400,
  maxValue,
  valueFormatter = (value) => value.toLocaleString(),
  tooltipFormatter,
  onBarClick,
  className = "",
  animate = true,
  layout = "vertical",
  labelWidth = 120,
  interactionHint,
}: SimpleBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })
  const chartRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setChartDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Calculate the maximum value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.map((item) => item.value || 0)) * 1.1 || 100

  // Ensure we have a non-zero max value for the chart scale
  const effectiveMaxValue = calculatedMaxValue > 0 ? calculatedMaxValue : 100

  // Chart dimensions
  const isHorizontal = layout === "horizontal"
  const chartAreaHeight = height - 60 // Reserve space for axis labels

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
  }

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height: `${height}px` }}
      ref={containerRef}
      onMouseMove={handleInteraction}
    >
      {interactionHint && !hasInteracted && <ChartInteractionHint message={interactionHint} position="top-right" />}

      {/* Chart container */}
      <div className="relative h-full" ref={chartRef}>
        {/* Chart area */}
        <div
          className="absolute"
          style={{
            left: isHorizontal ? labelWidth : 0,
            right: 0,
            top: 0,
            bottom: 40,
            height: `${chartAreaHeight}px`,
          }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <div
              key={`grid-${tick}`}
              className={`absolute ${isHorizontal ? "border-l" : "border-b"} border-gray-200 dark:border-gray-800`}
              style={
                isHorizontal
                  ? {
                      left: `${tick * 100}%`,
                      top: 0,
                      bottom: 0,
                    }
                  : {
                      bottom: `${tick * chartAreaHeight}px`,
                      left: 0,
                      right: 0,
                    }
              }
            >
              <span
                className="absolute text-xs text-gray-500 font-mono"
                style={
                  isHorizontal
                    ? {
                        bottom: -25,
                        left: 0,
                        transform: "translateX(-50%)",
                      }
                    : {
                        left: -5,
                        bottom: 0,
                        transform: "translateY(50%)",
                      }
                }
              >
                {valueFormatter(effectiveMaxValue * tick)}
              </span>
            </div>
          ))}

          {/* Labels for horizontal layout */}
          {isHorizontal && (
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{ width: `${labelWidth}px`, left: `-${labelWidth}px` }}
            >
              {data.map((item, index) => {
                const barHeight = (chartAreaHeight / data.length) * 0.7
                const barSpacing = (chartAreaHeight / data.length) * 0.3
                const yPosition = index * (barHeight + barSpacing) + barHeight / 2

                return (
                  <div
                    key={`label-${index}`}
                    className="absolute truncate text-right pr-4 text-xs text-gray-500 font-mono"
                    style={{
                      top: `${yPosition}px`,
                      transform: "translateY(-50%)",
                      width: `${labelWidth - 10}px`,
                      maxWidth: `${labelWidth - 10}px`,
                    }}
                  >
                    {item.name}
                  </div>
                )
              })}
            </div>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            if (item.value === undefined || item.value === null) return null

            const barValue = (item.value / effectiveMaxValue) * 100
            const isHovered = hoveredIndex === index

            // Calculate bar dimensions and position based on layout
            if (isHorizontal) {
              // Horizontal layout (bars go from left to right)
              const barHeight = (chartAreaHeight / data.length) * 0.7
              const barSpacing = (chartAreaHeight / data.length) * 0.3
              const yPosition = index * (barHeight + barSpacing)

              return (
                <CursorTooltip
                  key={`bar-${index}`}
                  content={
                    tooltipFormatter ? (
                      tooltipFormatter(item)
                    ) : (
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div>{valueFormatter(item.value)}</div>
                        {onBarClick && <div className="text-xs text-blue-500 mt-1">Click for details</div>}
                      </div>
                    )
                  }
                >
                  <div
                    className="absolute cursor-pointer"
                    style={{
                      top: `${yPosition}px`,
                      left: 0,
                      height: `${barHeight}px`,
                      width: "100%",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onBarClick && onBarClick(item)}
                  >
                    <motion.div
                      className="h-full rounded-r-sm"
                      style={{
                        width: `${barValue}%`,
                        backgroundColor: item.color || "#3b82f6",
                        opacity: isHovered ? 1 : 0.8,
                      }}
                      initial={animate ? { width: 0 } : { width: `${barValue}%` }}
                      animate={{ width: `${barValue}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                    />

                    {/* Value label */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 text-xs font-medium"
                      style={{
                        left: `calc(${barValue}% + 8px)`,
                        opacity: isHovered ? 1 : 0.7,
                      }}
                    >
                      {valueFormatter(item.value)}
                    </div>
                  </div>
                </CursorTooltip>
              )
            } else {
              // Vertical layout (bars go from bottom to top)
              const barWidth = (100 / data.length) * 0.7
              const barSpacing = (100 / data.length) * 0.3
              const xPosition = index * (barWidth + barSpacing) + barSpacing / 2
              const barHeight = (barValue / 100) * chartAreaHeight

              return (
                <CursorTooltip
                  key={`bar-${index}`}
                  content={
                    tooltipFormatter ? (
                      tooltipFormatter(item)
                    ) : (
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div>{valueFormatter(item.value)}</div>
                        {onBarClick && <div className="text-xs text-blue-500 mt-1">Click for details</div>}
                      </div>
                    )
                  }
                >
                  <div
                    className="absolute cursor-pointer"
                    style={{
                      bottom: 0,
                      left: `${xPosition}%`,
                      width: `${barWidth}%`,
                      height: `${chartAreaHeight}px`,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onBarClick && onBarClick(item)}
                  >
                    <motion.div
                      className="absolute bottom-0 w-full rounded-t-sm"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: item.color || "#3b82f6",
                        opacity: isHovered ? 1 : 0.8,
                      }}
                      initial={animate ? { height: 0 } : { height: `${barHeight}px` }}
                      animate={{ height: `${barHeight}px` }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                    />

                    {/* Value label */}
                    <div
                      className="absolute text-xs font-medium"
                      style={{
                        bottom: `${barHeight + 4}px`,
                        left: "50%",
                        transform: "translateX(-50%)",
                        opacity: isHovered ? 1 : 0.7,
                      }}
                    >
                      {valueFormatter(item.value)}
                    </div>
                  </div>
                </CursorTooltip>
              )
            }
          })}
        </div>

        {/* X-axis labels for vertical layout */}
        {!isHorizontal && (
          <div className="absolute left-0 right-0 bottom-0">
            {data.map((item, index) => {
              const barWidth = (100 / data.length) * 0.7
              const barSpacing = (100 / data.length) * 0.3
              const xPosition = index * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2

              return (
                <div
                  key={`x-label-${index}`}
                  className="absolute text-xs text-gray-500 font-mono transform -translate-x-1/2"
                  style={{
                    left: `${xPosition}%`,
                    bottom: 10,
                    maxWidth: `${barWidth * 1.5}%`,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
