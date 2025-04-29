"use client"

import React, { useState, useRef, useEffect } from "react"
import { CursorTooltip } from "./cursor-tooltip"

interface SlopeChartProps {
  data: Array<{
    id: string | number
    name: string
    start: { value: number; label: string }
    end: { value: number; label: string }
    color?: string
    [key: string]: any
  }>
  height?: number
  valueFormatter?: (value: number) => string
  tooltipFormatter?: (item: any, position: "start" | "end") => React.ReactNode
  onItemClick?: (item: any) => void
  className?: string
  animate?: boolean
}

export function SlopeChart({
  data,
  height = 400,
  valueFormatter = (value) => value.toLocaleString(),
  tooltipFormatter,
  onItemClick,
  className = "",
  animate = true,
}: SlopeChartProps) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height })
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setChartDimensions({
          width: containerRef.current.getBoundingClientRect().width,
          height,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [height])

  // Chart margins
  const margin = {
    top: 40,
    right: 120,
    bottom: 40,
    left: 120,
  }

  // Calculate chart area dimensions
  const chartWidth = chartDimensions.width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // Find min and max values for scaling
  const allValues = data.flatMap((item) => [
    typeof item.start?.value === "number" ? item.start.value : 0,
    typeof item.end?.value === "number" ? item.end.value : 0,
  ])

  const minValue = Math.min(...allValues) * 0.9
  const maxValue = Math.max(...allValues) * 1.1

  // Generate tick values
  const tickCount = 5
  const tickValues = Array.from(
    { length: tickCount },
    (_, i) => minValue + ((maxValue - minValue) * i) / (tickCount - 1),
  )

  // Scale value to y position
  const getYPosition = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) return margin.top
    return margin.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} style={{ height: `${height}px` }}>
      {chartDimensions.width > 0 && (
        <svg width="100%" height={height}>
          {/* Chart title area */}
          <text
            x={margin.left / 2}
            y={margin.top / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-medium fill-current"
          >
            {data[0]?.start.label || "Start"}
          </text>

          <text
            x={chartDimensions.width - margin.right / 2}
            y={margin.top / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-medium fill-current"
          >
            {data[0]?.end.label || "End"}
          </text>

          {/* Grid lines and tick labels */}
          {tickValues.map((value, i) => {
            const y = getYPosition(value)
            return (
              <g key={`tick-${i}`}>
                {/* Grid line */}
                <line
                  x1={margin.left}
                  y1={y}
                  x2={chartDimensions.width - margin.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  strokeDasharray="4,4"
                />

                {/* Left tick label */}
                <text
                  x={margin.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500 font-mono"
                >
                  {valueFormatter(value)}
                </text>

                {/* Right tick label */}
                <text
                  x={chartDimensions.width - margin.right + 10}
                  y={y}
                  textAnchor="start"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-500 font-mono"
                >
                  {valueFormatter(value)}
                </text>
              </g>
            )
          })}

          {/* Vertical axis lines */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="currentColor"
            strokeOpacity={0.2}
          />

          <line
            x1={chartDimensions.width - margin.right}
            y1={margin.top}
            x2={chartDimensions.width - margin.right}
            y2={height - margin.bottom}
            stroke="currentColor"
            strokeOpacity={0.2}
          />

          {/* Slope lines */}
          {data.map((item, index) => {
            if (!item) return null

            const startY = getYPosition(item.start?.value)
            const endY = getYPosition(item.end?.value)
            const isHovered = hoveredId === item.id
            const lineColor = item.color || "#3b82f6"

            return (
              <g key={item.id || index}>
                {/* Slope line */}
                <line
                  x1={margin.left}
                  y1={startY}
                  x2={chartDimensions.width - margin.right}
                  y2={endY}
                  stroke={lineColor}
                  strokeWidth={isHovered ? 3 : 1.5}
                  strokeOpacity={isHovered ? 1 : 0.7}
                  className="transition-all duration-200"
                />
              </g>
            )
          })}
        </svg>
      )}

      {/* Interactive elements (outside SVG for better tooltip handling) */}
      <div className="absolute inset-0 pointer-events-none">
        {data.map((item, index) => {
          if (!item) return null

          const startY = getYPosition(item.start?.value)
          const endY = getYPosition(item.end?.value)
          const isHovered = hoveredId === item.id
          const lineColor = item.color || "#3b82f6"

          return (
            <React.Fragment key={item.id || index}>
              {/* Start point */}
              <CursorTooltip
                content={
                  tooltipFormatter ? (
                    tooltipFormatter(item, "start")
                  ) : (
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div>
                        {item.start.label}: {valueFormatter(item.start.value)}
                      </div>
                    </div>
                  )
                }
              >
                <div
                  className="absolute rounded-full cursor-pointer pointer-events-auto transition-all duration-200"
                  style={{
                    left: margin.left,
                    top: startY,
                    width: isHovered ? 14 : 10,
                    height: isHovered ? 14 : 10,
                    backgroundColor: lineColor,
                    transform: "translate(-50%, -50%)",
                    zIndex: 20,
                    boxShadow: isHovered ? `0 0 0 4px ${lineColor}33` : "none",
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onItemClick && onItemClick(item)}
                />
              </CursorTooltip>

              {/* End point */}
              <CursorTooltip
                content={
                  tooltipFormatter ? (
                    tooltipFormatter(item, "end")
                  ) : (
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div>
                        {item.end.label}: {valueFormatter(item.end.value)}
                      </div>
                    </div>
                  )
                }
              >
                <div
                  className="absolute rounded-full cursor-pointer pointer-events-auto transition-all duration-200"
                  style={{
                    left: chartDimensions.width - margin.right,
                    top: endY,
                    width: isHovered ? 14 : 10,
                    height: isHovered ? 14 : 10,
                    backgroundColor: lineColor,
                    transform: "translate(-50%, -50%)",
                    zIndex: 20,
                    boxShadow: isHovered ? `0 0 0 4px ${lineColor}33` : "none",
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onItemClick && onItemClick(item)}
                />
              </CursorTooltip>

              {/* Labels when hovered */}
              {isHovered && (
                <>
                  <div
                    className="absolute text-xs font-medium pointer-events-none"
                    style={{
                      left: margin.left - 10,
                      top: startY,
                      transform: "translate(-100%, -50%)",
                      color: lineColor,
                      width: margin.left - 20,
                      textAlign: "right",
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    className="absolute text-xs font-medium pointer-events-none"
                    style={{
                      left: chartDimensions.width - margin.right + 10,
                      top: endY,
                      transform: "translate(0%, -50%)",
                      color: lineColor,
                      width: margin.right - 20,
                      textAlign: "left",
                    }}
                  >
                    {item.name}
                  </div>
                </>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
