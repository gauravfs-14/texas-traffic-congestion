"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right"

interface ChartInteractionHintProps {
  message: string
  position?: Position
  duration?: number
}

export function ChartInteractionHint({ message, position = "top-right", duration = 10000 }: ChartInteractionHintProps) {
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!dismissed && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, dismissed])

  if (!visible) return null

  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`absolute ${positionClasses[position]} z-50 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-md p-2 pr-8 shadow-md max-w-[200px]`}
    >
      {message}
      <button
        onClick={() => {
          setDismissed(true)
          setVisible(false)
        }}
        className="absolute top-1 right-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
        aria-label="Dismiss hint"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
