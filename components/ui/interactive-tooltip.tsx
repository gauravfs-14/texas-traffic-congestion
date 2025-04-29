"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface InteractiveTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  className?: string
}

export function InteractiveTooltip({ content, children, className }: InteractiveTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const childRef = useRef<HTMLElement>(null)

  const handleMouseMove = (e: MouseEvent) => {
    if (!tooltipRef.current) return

    const tooltipWidth = tooltipRef.current.offsetWidth
    const tooltipHeight = tooltipRef.current.offsetHeight

    // Calculate position with offset to avoid cursor overlap
    const offsetX = 15
    const offsetY = -tooltipHeight - 15

    // Ensure we have valid numbers before setting position
    // Use default values if calculations result in NaN
    const x = e.clientX + offsetX
    const y = e.clientY + offsetY

    // Adjust position to keep tooltip within viewport
    const safeX = Math.min(isNaN(x) ? 0 : x, window.innerWidth - tooltipWidth - 20)
    const safeY = Math.max(isNaN(y) ? 0 : y, 20)

    setPosition({ x: safeX, y: safeY })
  }

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    const element = childRef.current
    if (!element) return

    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)
    element.addEventListener("mousemove", handleMouseMove)

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
      element.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Clone the child element to add ref
  const childElement = React.cloneElement(children, {
    ref: childRef,
  })

  return (
    <>
      {childElement}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn("fixed z-50 max-w-xs pointer-events-none", className)}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-3 text-sm">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
