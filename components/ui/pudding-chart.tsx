"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { PuddingTooltip } from "./pudding-tooltip"
import type { puddingPalettes } from "@/lib/pudding-chart-utils"

interface PuddingChartProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  footnote?: string
  source?: string
  colorPalette?: keyof typeof puddingPalettes
  interactive?: boolean
  fullWidth?: boolean
  maxWidth?: number
  height?: number
  backgroundColor?: string
  borderColor?: string
  titleColor?: string
  subtitleColor?: string
  footnoteColor?: string
}

export function PuddingChart({
  title,
  subtitle,
  children,
  className,
  footnote,
  source,
  colorPalette = "main",
  interactive = true,
  fullWidth = false,
  maxWidth = 1200,
  height,
  backgroundColor = "transparent",
  borderColor = "transparent",
  titleColor,
  subtitleColor,
  footnoteColor,
}: PuddingChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (chartRef.current) {
      observer.observe(chartRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={chartRef}
      className={cn("relative mx-auto my-8 overflow-hidden", fullWidth ? "w-full" : "", className)}
      style={{
        maxWidth: fullWidth ? "none" : maxWidth,
        height: height ? `${height}px` : "auto",
        backgroundColor,
        borderColor,
      }}
      data-color-palette={colorPalette}
    >
      {title && (
        <h3
          className={cn(
            "text-2xl font-bold mb-1",
            isInView && "animate-in fade-in slide-in-from-bottom-2 duration-500",
          )}
          style={{ color: titleColor }}
        >
          {title}
        </h3>
      )}

      {subtitle && (
        <p
          className={cn(
            "text-base text-gray-600 dark:text-gray-400 mb-4",
            isInView && "animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100",
          )}
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </p>
      )}

      <div className={cn("relative", isInView && "animate-in fade-in duration-700 delay-200")}>{children}</div>

      {(footnote || source) && (
        <div
          className={cn(
            "mt-4 text-xs text-gray-500 dark:text-gray-400",
            isInView && "animate-in fade-in slide-in-from-bottom-1 duration-500 delay-300",
          )}
        >
          {footnote && (
            <p className="italic" style={{ color: footnoteColor }}>
              {footnote}
            </p>
          )}

          {source && <p className="mt-1">Source: {source}</p>}
        </div>
      )}
    </div>
  )
}

// Bar component for custom bar charts
export function PuddingBar({
  value,
  maxValue,
  label,
  color,
  height = 30,
  animate = true,
  tooltip,
  onClick,
  className,
}: {
  value: number
  maxValue: number
  label?: string
  color?: string
  height?: number
  animate?: boolean
  tooltip?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const percentage = (value / maxValue) * 100
  const barRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(!animate)

  useEffect(() => {
    if (!animate) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (barRef.current) {
      observer.observe(barRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [animate])

  const bar = (
    <div
      ref={barRef}
      className={cn(
        "flex items-center group cursor-pointer transition-all duration-300",
        onClick && "hover:opacity-90",
        className,
      )}
      style={{ height: `${height}px` }}
      onClick={onClick}
    >
      <div className="flex-1 flex items-center">
        {label && <div className="w-1/4 pr-3 text-sm font-medium truncate">{label}</div>}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: isInView ? `${percentage}%` : "0%",
              backgroundColor: color || "#ff4e50",
              transitionDelay: "200ms",
            }}
          />
        </div>
      </div>
      <div className="ml-3 text-sm font-medium">{value.toLocaleString()}</div>
    </div>
  )

  return tooltip ? (
    <PuddingTooltip content={tooltip} position="top">
      {bar}
    </PuddingTooltip>
  ) : (
    bar
  )
}

// Dot component for scatter plots
export function PuddingDot({
  x,
  y,
  size = 8,
  color = "#ff4e50",
  opacity = 0.8,
  tooltip,
  onClick,
  className,
}: {
  x: number
  y: number
  size?: number
  color?: string
  opacity?: number
  tooltip?: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  const dot = (
    <div
      className={cn(
        "absolute rounded-full transition-all duration-300",
        onClick && "cursor-pointer hover:opacity-100 hover:scale-110",
        className,
      )}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        opacity,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    />
  )

  return tooltip ? (
    <PuddingTooltip content={tooltip} position="top">
      {dot}
    </PuddingTooltip>
  ) : (
    dot
  )
}

// Line component for line charts
export function PuddingLine({
  points,
  color = "#ff4e50",
  strokeWidth = 2,
  animate = true,
  className,
}: {
  points: { x: number; y: number }[]
  color?: string
  strokeWidth?: number
  animate?: boolean
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [isInView, setIsInView] = useState(!animate)
  const [pathLength, setPathLength] = useState(0)

  // Generate SVG path from points
  const pathData = points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  useEffect(() => {
    if (!animate) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (svgRef.current) {
      observer.observe(svgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [animate])

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [points])

  return (
    <svg
      ref={svgRef}
      className={cn("absolute top-0 left-0 w-full h-full", className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isInView ? 0 : pathLength,
          transition: "stroke-dashoffset 1.5s ease-in-out",
        }}
      />
    </svg>
  )
}

// Area component for area charts
export function PuddingArea({
  points,
  color = "#ff4e50",
  fillOpacity = 0.2,
  strokeWidth = 2,
  animate = true,
  className,
}: {
  points: { x: number; y: number }[]
  color?: string
  fillOpacity?: number
  strokeWidth?: number
  animate?: boolean
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const [isInView, setIsInView] = useState(!animate)
  const [pathLength, setPathLength] = useState(0)

  // Generate SVG path from points
  const linePath = points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  // Generate area path (line + bottom border)
  const areaPath = `${linePath} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`

  useEffect(() => {
    if (!animate) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (svgRef.current) {
      observer.observe(svgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [animate])

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [points])

  return (
    <svg
      ref={svgRef}
      className={cn("absolute top-0 left-0 w-full h-full", className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        ref={areaRef}
        d={areaPath}
        fill={color}
        fillOpacity={isInView ? fillOpacity : 0}
        style={{
          transition: "fill-opacity 1s ease-in-out",
          transitionDelay: "0.5s",
        }}
      />
      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset: isInView ? 0 : pathLength,
          transition: "stroke-dashoffset 1.5s ease-in-out",
        }}
      />
    </svg>
  )
}
