"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PuddingTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: "top" | "bottom" | "left" | "right"
  offset?: number
  delay?: number
  className?: string
  contentClassName?: string
  showArrow?: boolean
  interactive?: boolean
  maxWidth?: number
}

export function PuddingTooltip({
  content,
  children,
  position = "top",
  offset = 8,
  delay = 0,
  className,
  contentClassName,
  showArrow = true,
  interactive = false,
  maxWidth = 300,
}: PuddingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const childRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (!interactive) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 100)
    }
  }

  const handleTooltipMouseEnter = () => {
    if (interactive && timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 100)
    }
  }

  const updatePosition = () => {
    if (!childRef.current || !tooltipRef.current) return

    const childRect = childRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let x = 0
    let y = 0

    switch (position) {
      case "top":
        x = childRect.left + childRect.width / 2 - tooltipRect.width / 2
        y = childRect.top - tooltipRect.height - offset
        break
      case "bottom":
        x = childRect.left + childRect.width / 2 - tooltipRect.width / 2
        y = childRect.bottom + offset
        break
      case "left":
        x = childRect.left - tooltipRect.width - offset
        y = childRect.top + childRect.height / 2 - tooltipRect.height / 2
        break
      case "right":
        x = childRect.right + offset
        y = childRect.top + childRect.height / 2 - tooltipRect.height / 2
        break
    }

    // Adjust if tooltip goes out of viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (x < 10) x = 10
    if (x + tooltipRect.width > viewportWidth - 10) {
      x = viewportWidth - tooltipRect.width - 10
    }

    if (y < 10) y = 10
    if (y + tooltipRect.height > viewportHeight - 10) {
      y = viewportHeight - tooltipRect.height - 10
    }

    setCoords({ x, y })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener("scroll", updatePosition)
      window.addEventListener("resize", updatePosition)
    }

    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isVisible])

  // Clone the child element to add event handlers
  const childElement = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
  })

  return (
    <>
      {childElement}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn("fixed z-50 transform-gpu", "animate-in fade-in zoom-in-95 duration-200", className)}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            maxWidth: `${maxWidth}px`,
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div
            className={cn(
              "rounded-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm",
              "border border-gray-200 dark:border-gray-800",
              "shadow-lg p-3 text-sm",
              "text-gray-900 dark:text-gray-100",
              contentClassName,
            )}
          >
            {content}
          </div>
          {showArrow && (
            <div
              className={cn(
                "absolute w-3 h-3 bg-white dark:bg-gray-900 rotate-45",
                "border border-gray-200 dark:border-gray-800",
                position === "top" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-0 border-l-0",
                position === "bottom" && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-0 border-r-0",
                position === "left" && "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-b-0 border-l-0",
                position === "right" && "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-r-0",
              )}
            />
          )}
        </div>
      )}
    </>
  )
}
