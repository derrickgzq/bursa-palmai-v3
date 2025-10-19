"use client"

import { TrendingUp } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
    { month: "January", klci: 500, plantation: 4000 },
    { month: "February", klci: 312, plantation: 7050 },
    { month: "March", klci: 1498, plantation: 8100 },
    { month: "April", klci: 2225, plantation: 1150 },
    { month: "May", klci: 3030, plantation: 5200 },
    { month: "June", klci: 5540, plantation: 7250 },
]

const chartConfig = {
    klci: {
        label: "KLCI",
        color: "var(--chart-1)",
    },
    plantation: {
        label: "Plantation Index",
        color: "var(--chart-2)",
    },
}

export function IndexChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>KLCI vs Plantation Index</CardTitle>
                <CardDescription>
                    Comparative area chart for the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
                        height={50}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="2 4"
                            stroke="var(--border)"
                        />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                            stroke="var(--muted-foreground)"
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillKLCI" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillPlantation" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="plantation"
                            type="natural"
                            fill="url(#fillPlantation)"
                            fillOpacity={0.4}
                            stroke="var(--chart-2)"
                            strokeWidth={2}
                            stackId="a"
                            name="Plantation Index"
                        />
                        <Area
                            dataKey="klci"
                            type="natural"
                            fill="url(#fillKLCI)"
                            fillOpacity={0.4}
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                            stackId="a"
                            name="KLCI"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Plantation Index trending up{" "}
                            <TrendingUp className="h-4 w-4 text-[color:var(--chart-2)]" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            January - June 2024
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}