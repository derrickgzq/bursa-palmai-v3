"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export function ExternalToggleChart() {
    const [activeChart, setActiveChart] =
        React.useState<"diesel" | "freight">("diesel");
    const [dieselData, setDieselData] = React.useState<any[]>([]);
    const [freightData, setFreightData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch diesel data
    React.useEffect(() => {
        async function fetchData() {
            try {
                const dieselRes = await fetch("http://127.0.0.1:8000/api/diesel-prices");
                const freightRes = await fetch(
                    "http://127.0.0.1:8000/api/container-freight-index"
                );

                const dieselJson = await dieselRes.json();
                const freightJson = await freightRes.json();

                // Sort diesel by date ascending
                const dieselProcessed = dieselJson
                    .map((d: any) => ({
                        date: d.date,
                        diesel: d.diesel,
                        diesel_eastmsia: d.diesel_eastmsia,
                    }))
                    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                // Group freight data by date
                const freightGrouped = Object.values(
                    freightJson.reduce((acc: any, curr: any) => {
                        if (!acc[curr.date]) acc[curr.date] = { date: curr.date };
                        acc[curr.date][curr.category] = curr.value;
                        return acc;
                    }, {})
                ).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setDieselData(dieselProcessed);
                setFreightData(freightGrouped);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const chartConfig: Record<string, any> = {
        diesel: {
            label: "Diesel Prices (RM/litre)",
            color: "var(--chart-1)",
        },
        freight: {
            label: "Container Freight Index",
            color: "var(--chart-2)",
        },
    };

    const currentData = activeChart === "diesel" ? dieselData : freightData;

    // Compute total values (for display on toggle)
    const total = React.useMemo(() => {
        return {
            diesel: dieselData.reduce((sum, d) => sum + d.diesel, 0),
            freight: freightData.reduce((sum, d) => {
                const composite = d["COMPOSITE INDEX"] ?? 0;
                return sum + composite;
            }, 0),
        };
    }, [dieselData, freightData]);

    return (
        <Card className="py-0">
            {/* Header with Toggle */}
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>Diesel vs Freight Index</CardTitle>
                    <CardDescription>
                        Showing data fetched from backend APIs
                    </CardDescription>
                </div>
                <div className="flex">
                    {["diesel", "freight"].map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(key as "diesel" | "freight")}
                        >
                            <span className="text-muted-foreground text-xs">
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg leading-none font-bold sm:text-3xl">
                                {total[key as "diesel" | "freight"].toLocaleString()}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>

            {/* Chart Section */}
            <CardContent className="px-2 sm:p-6">
                {loading ? (
                    <p className="text-center text-sm text-muted-foreground">
                        Loading data...
                    </p>
                ) : (
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[300px] w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={currentData}
                            margin={{ left: 12, right: 12 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(v) =>
                                    new Date(v).toLocaleDateString("en-GB", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[160px]"
                                        labelFormatter={(value) =>
                                            new Date(value).toLocaleDateString("en-GB", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })
                                        }
                                    />
                                }
                            />
                            {activeChart === "diesel" ? (
                                <Bar
                                    dataKey="diesel"
                                    fill="var(--color-diesel)"
                                    radius={6}
                                />
                            ) : (
                                <Bar
                                    dataKey="COMPOSITE INDEX"
                                    fill="var(--color-freight)"
                                    radius={6}
                                />
                            )}
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
