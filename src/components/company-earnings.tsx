"use client"

import React, { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Line } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface FinancialRecord {
    date: string
    revenue: number
    net_profit: number
    net_profit_margin: number
}

interface ChartData {
    date: string
    revenue: number
    net_profit: number
    net_profit_margin: number
}

export function CompanyEarnings({ companyShortName }: { companyShortName: string }) {
    const [data, setData] = useState<ChartData[]>([])

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/earnings/${companyShortName}`)
            .then((res) => res.json())
            .then((raw: FinancialRecord[]) => {
                setData(
                    raw.map((item) => ({
                        date: item.date,
                        revenue: item.revenue,
                        net_profit: item.net_profit,
                        net_profit_margin: item.net_profit_margin,
                    }))
                )
            })
            .catch((err) => console.error("Error fetching financial data:", err))
    }, [companyShortName])

    const colors: Record<string, string> = {
        revenue: "var(--chart-1)",
        net_profit: "var(--chart-2)",
        net_profit_margin: "var(--chart-3)",
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Company Financials</CardTitle>
                <CardDescription>Revenue, Net Profit & Profit Margin</CardDescription>
            </CardHeader>
            <CardContent className="w-full">
                <ChartContainer
                    config={{
                        revenue: { label: "Revenue", color: colors.revenue },
                        net_profit: { label: "Net Profit", color: colors.net_profit },
                        net_profit_margin: { label: "Net Profit Margin (%)", color: colors.net_profit_margin },
                    }}
                >
                    <BarChart
                        data={data}
                        width={900}
                        height={400}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} />

                        {/* Left Y-axis for revenue & net profit */}
                        <YAxis yAxisId="left" />

                        {/* Right Y-axis for net profit margin */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(val) => `${val}%`}
                        />

                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />

                        {/* Bars use left Y-axis */}
                        <Bar dataKey="revenue" fill="var(--chart-1)" radius={4} yAxisId="left" />
                        <Bar dataKey="net_profit" fill="var(--chart-2)" radius={4} yAxisId="left" />

                        {/* Line uses right Y-axis */}
                        <Line
                            type="monotone"
                            dataKey="net_profit_margin"
                            stroke="var(--chart-3)"
                            strokeWidth={2}
                            yAxisId="right"
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
