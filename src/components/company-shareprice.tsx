"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface SharePriceData {
    dates: string[]
    prices: number[]
    error?: string
}

interface Props {
    companyShortName: string
}

const chartConfig = {
    price: {
        label: "Share Price",
        color: "var(--chart-1)",
    },
}

export function SharePriceChart({ companyShortName }: Props) {
    const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/shareprice/${companyShortName}`)
                const data: SharePriceData = await res.json()

                if (data.error) {
                    console.error(data.error)
                    setChartData([])
                    return
                }

                // ✅ Format date and combine with prices
                const formatted = data.dates.map((date, i) => ({
                    date: new Date(date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                    }), // e.g. "22 Oct"
                    price: data.prices[i],
                }))

                setChartData(formatted)
            } catch (err) {
                console.error("Failed to fetch share price:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [companyShortName])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">{companyShortName} Share Price</CardTitle>
                <CardDescription>Last 30 trading days</CardDescription>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Loading share price data...
                    </div>
                ) : chartData.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            data={chartData}
                            margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                            height={250}
                        >
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                interval="preserveStartEnd"
                                stroke="var(--muted-foreground)"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                domain={["dataMin - (dataMax - dataMin) * 0.05", "dataMax + (dataMax - dataMin) * 0.05"]}
                                stroke="var(--muted-foreground)"
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <defs>
                                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey="price"
                                type="monotone"
                                fill="url(#fillPrice)"
                                fillOpacity={0.4}
                                stroke="var(--chart-1)"
                                strokeWidth={2}
                                name="Share Price"
                            />
                        </AreaChart>
                    </ChartContainer>
                ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No data available
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
