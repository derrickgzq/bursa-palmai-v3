"use client"

import React, { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ProductionRecord {
    date: string
    raw_material: string
    volume: number
}

interface ChartData {
    month: string
    [key: string]: string | number
}

export function ProductionChart({
    companyShortName,
}: {
    companyShortName: string
}) {
    const [data, setData] = useState<ChartData[]>([])

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/production/${companyShortName}`)
            .then((res) => res.json())
            .then((raw: ProductionRecord[]) => {
                // Convert "YYYY-MM-DD" to month name
                const monthNames = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                ]

                // Group data by month
                const grouped: Record<string, any> = {}
                raw.forEach((item) => {
                    const monthIndex = parseInt(item.date.slice(5, 7)) - 1
                    const monthName = monthNames[monthIndex]
                    if (!grouped[monthName]) grouped[monthName] = { month: monthName }
                    grouped[monthName][item.raw_material] = item.volume
                })

                // Convert grouped object → array for Recharts
                setData(Object.values(grouped))
            })
            .catch((err) => console.error("Error fetching production data:", err))
    }, [companyShortName])

    const rawMaterialColors: Record<string, string> = {
        "Fresh Fruit Bunches": "var(--chart-1)",
        "Crude Palm Oil": "var(--chart-2)",
        "Palm Kernel": "var(--chart-3)",
        "Rubber": "var(--chart-4)",
    }

    return (
        <Card className="bg-transparent border border-zinc-800 w-full">
            <CardHeader>
                <CardTitle className="text-xl">Monthly Production Data</CardTitle>
                <CardDescription>Last 12 months by raw material</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer
                    config={{
                        volume: {
                            label: "Production Volume (tonnes)",
                            color: "var(--chart-1)",
                        },
                    }}
                >
                    <BarChart
                        data={data}
                        width={900}
                        height={400}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        {Object.entries(rawMaterialColors).map(([key, color]) => (
                            <Bar key={key} dataKey={key} fill={color} radius={4} />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
