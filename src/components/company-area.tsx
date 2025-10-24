"use client"

import React, { useEffect, useState, useMemo } from "react"
import { PieChart, Pie, Sector, Label, Legend } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

export interface PlantationAreaData {
  date: number
  company_short_name: string
  value: number
  category: string
}

interface CompanyAreaPieProps {
  companyShortName: string
}

export function PlantationChart({ companyShortName }: CompanyAreaPieProps) {
  const [data, setData] = useState<PlantationAreaData[] | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!companyShortName) return

    fetch(`http://127.0.0.1:8000/api/plantation-area/${companyShortName}`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error("Error fetching plantation area:", err))
  }, [companyShortName])

  // Hooks always come first
  const matureValue = useMemo(() => {
    if (!data) return 0
    const mature = data.find((d) => d.category === "Mature")
    return mature ? mature.value : 0
  }, [data])

  if (!data) return <Skeleton className="h-64 w-full rounded-md" />

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.value,
    fill: d.category === "Mature" ? "var(--chart-1)" : "var(--chart-2)",
  }))

  const chartConfig: ChartConfig = {
    Mature: { label: "Mature", color: "var(--chart-1)" },
    Immature: { label: "Immature", color: "var(--chart-2)" },
  }

  const onPieEnter = (_: any, index: number) => setActiveIndex(index)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl">Plantation Area</CardTitle>
        <CardDescription>{`Area distribution for ${companyShortName}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
              onMouseEnter={onPieEnter}
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {matureValue.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        acre Mature
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
