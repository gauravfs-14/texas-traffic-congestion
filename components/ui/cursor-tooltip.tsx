"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CursorTooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  className?: string
  offset?: { x: number; y: number }
  followCursor?: boolean
}

export function CursorTooltip({
  content,
  children,
  className,
  offset = { x: 15, y: 10 },
  followCursor = true,
}: CursorTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const childRef = useRef<HTMLElement>(null)
  const initialPositionSet = useRef(false)

  const handleMouseMove = (e: MouseEvent) => {
    if (!followCursor && initialPositionSet.current) return

    // Calculate position with offset to avoid cursor overlap
    const x = e.clientX + offset.x
    const y = e.clientY + offset.y

    // Adjust position to keep tooltip within viewport
    if (tooltipRef.current) {
      const tooltipWidth = tooltipRef.current.offsetWidth
      const tooltipHeight = tooltipRef.current.offsetHeight

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Ensure tooltip stays within viewport bounds
      const safeX = Math.min(Math.max(0, x), viewportWidth - tooltipWidth)
      const safeY = Math.min(Math.max(0, y), viewportHeight - tooltipHeight)

      setPosition({ x: safeX, y: safeY })
      initialPositionSet.current = true
    } else {
      setPosition({ x, y })
    }
  }

  useEffect(() => {
    const element = childRef.current
    if (!element) return

    const handleMouseEnter = () => {
      setIsVisible(true)
      initialPositionSet.current = false
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    element.addEventListener("mouseenter", handleMouseEnter)
    element.addEventListener("mouseleave", handleMouseLeave)
    element.addEventListener("mousemove", handleMouseMove)

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter)
      element.removeEventListener("mouseleave", handleMouseLeave)
      element.removeEventListener("mousemove", handleMouseMove)
    }
  }, [followCursor])

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed z-50 pointer-events-none max-w-xs",
              "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
              "rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-3",
              "text-sm",
              className,
            )}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
