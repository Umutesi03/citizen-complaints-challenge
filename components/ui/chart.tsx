"use client"

import * as React from "react"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider")
  }

  return context
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

function ChartContainer({ config, children, className }: ChartContainerProps) {
  // Set CSS variables for chart colors
  React.useEffect(() => {
    const root = document.documentElement
    Object.entries(config).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value.color)
    })

    return () => {
      Object.keys(config).forEach((key) => {
        root.style.removeProperty(`--color-${key}`)
      })
    }
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("w-full h-full", className)}>{children}</div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      [key: string]: any
    }
  }>
  label?: string
  className?: string
  formatter?: (value: number, name: string, props: any) => React.ReactNode
}

function ChartTooltipContent({ active, payload, label, className, formatter }: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background px-3 py-2 text-sm shadow-sm", className)}>
      <div className="font-medium">{label}</div>
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((item, index) => {
          const color = config[item.name]?.color
          const formattedValue = formatter ? formatter(item.value, item.name, item.payload) : item.value

          return (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
                <span className="text-muted-foreground">{config[item.name]?.label ?? item.name}:</span>
              </div>
              <span className="font-medium tabular-nums">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {
  className?: string
}

function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return <ChartTooltipContent className={className} {...props} />
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
