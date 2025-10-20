"use client"

import React, { useEffect, useState } from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"

export interface ExtractionData {
    date: string
    company_short_name: string
    value: number
    category: string
}

interface CompanyExtractionProps {
    companyShortName: string
}

export function ExtractionChart({ companyShortName }: CompanyExtractionProps) {
    const [data, setData] = useState<ExtractionData[] | null>(null)

    useEffect(() => {
        if (!companyShortName) return

        fetch(`http://127.0.0.1:8000/api/extraction/${companyShortName}`)
            .then((res) => res.json())
            .then((resData) => {
                const sorted = resData.sort(
                    (a: ExtractionData, b: ExtractionData) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                )
                setData(sorted)
            })
            .catch((err) => console.error("Error fetching extraction data:", err))
    }, [companyShortName])

    if (!data) return <Skeleton className="h-64 w-full rounded-md" />

    // Prepare wide-format data for aligned lines
    const dates = Array.from(new Set(data.map((d) => d.date))).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )
    const categories = Array.from(new Set(data.map((d) => d.category)))

    const chartData = dates.map((date) => {
        const row: any = { date }
        categories.forEach((cat) => {
            const entry = data.find((d) => d.date === date && d.category === cat)
            row[cat] = entry ? entry.value : 0
        })
        return row
    })

    const chartConfig: Record<string, { label: string; color: string }> = {}
    categories.forEach((cat, idx) => {
        chartConfig[cat] = { label: cat, color: `var(--chart-${idx + 1})` }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Oil Extraction Rates</CardTitle>
                <CardDescription>Daily extraction rate for {companyShortName}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart data={chartData} margin={{ top: 20, left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(date) => new Date(date).getFullYear().toString()}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        {categories.map((cat, idx) => (
                            <Line
                                key={cat}
                                dataKey={cat}
                                name={cat}
                                type="natural"
                                stroke={`var(--chart-${idx + 1})`}
                                strokeWidth={2}
                                dot={{ fill: `var(--chart-${idx + 1})` }}
                                activeDot={{ r: 6 }}
                            >
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Line>
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
