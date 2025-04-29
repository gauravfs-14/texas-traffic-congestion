"use client"

import type * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: number, name: string, props: any) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  contentStyle?: React.CSSProperties
  itemStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
  cursor?: boolean | React.ReactNode
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
  children,
  ...props
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <Card
      className={cn("p-0 shadow-lg border-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm", className)}
      {...props}
    >
      <CardContent className="p-3">
        {label && <div className="font-medium text-base">{labelFormatter ? labelFormatter(label) : label}</div>}
        <div className="mt-2 space-y-1">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}: </span>
              <span className="font-medium ml-1">
                {formatter ? formatter(item.value, item.name, item) : item.value}
              </span>
            </div>
          ))}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
