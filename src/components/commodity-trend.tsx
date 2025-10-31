"use client";

import { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { ExternalToggleChart } from "@/components/commodity-trend-external-stats";
import {
    Area,
    AreaChart,
} from "recharts";

interface MPOBStat {
    date: string;
    category: string;
    value: number;
}

interface RawMaterial {
    date: string;
    category: string;
    value: number;
}

export function CommodityTrend() {
    const [mpobData, setMpobData] = useState<MPOBStat[]>([]);
    const [rawMaterialData, setRawMaterialData] = useState<RawMaterial[]>([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/mpob-statistics")
            .then((res) => res.json())
            .then((data) => setMpobData(data));
        fetch("http://127.0.0.1:8000/api/raw-material-prices")
            .then((res) => res.json())
            .then((data) => setRawMaterialData(data));
    }, []);

    // MPOB Data Processing
    const sortedMpobDates = useMemo(() => {
        const dates = Array.from(new Set(mpobData.map((d) => d.date))).sort();
        return dates;
    }, [mpobData]);

    const latestMpobDate = sortedMpobDates.at(-1) || "";
    const prevMpobDate = sortedMpobDates.at(-2) || "";

    const getMpobValue = (category: string, date?: string) =>
        mpobData.find((d) => d.category === category && d.date === (date || latestMpobDate))?.value ?? 0;

    const calcMpobChange = (category: string) => {
        const current = getMpobValue(category, latestMpobDate);
        const previous = getMpobValue(category, prevMpobDate);
        if (!previous || !latestMpobDate || !prevMpobDate) return null;
        const diff = ((current - previous) / previous) * 100;
        return diff;
    };

    const mpobChartData = useMemo(() => {
        const result: Record<string, any> = {};
        mpobData.forEach((item) => {
            const formattedDate = new Date(item.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
            });
            if (!result[formattedDate]) result[formattedDate] = { month: formattedDate };
            result[formattedDate][item.category] = item.value;
        });
        return Object.values(result);
    }, [mpobData]);

    const mpobChartConfig: Record<string, { label: string; color: string }> = {
        "Crude Palm Oil Stocks": { label: "Crude Palm Oil Stocks", color: "#f59e0b" },
        "Processed Palm Oil Stocks": { label: "Processed Palm Oil Stocks", color: "#84cc16" },
        "Palm Oil Stocks": { label: "Palm Oil Stocks", color: "#10b981" },
        "Palm Kernel Oil Stocks": { label: "Palm Kernel Oil Stocks", color: "#6366f1" },
    };

    const renderMpobChangeBadge = (change: number | null) => {
        if (change === null) return null;
        const rounded = change.toFixed(1);
        return (
            <Badge
                variant="outline"
                className={`gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
                {change >= 0 ? (
                    <IconTrendingUp className="size-4" />
                ) : (
                    <IconTrendingDown className="size-4" />
                )}
                {rounded}% MoM
            </Badge>
        );
    };

    // Raw Material Data Processing
    const sortedRawDates = useMemo(() => {
        const dates = Array.from(new Set(rawMaterialData.map((d) => d.date))).sort();
        return dates;
    }, [rawMaterialData]);

    const latestRawDate = sortedRawDates.at(-1) || "";
    const prevRawDate = sortedRawDates.at(-2) || "";

    const getRawValue = (category: string, date?: string) =>
        rawMaterialData.find((d) => d.category === category && d.date === (date || latestRawDate))?.value ?? 0;

    const calcRawChange = (category: string) => {
        const current = getRawValue(category, latestRawDate);
        const previous = getRawValue(category, prevRawDate);
        if (!previous || !latestRawDate || !prevRawDate) return null;
        const diff = ((current - previous) / previous) * 100;
        return diff;
    };

    const rawChartData = useMemo(() => {
        const categories = ["palm kernel", "fresh fruit bunches", "local crude palm oil"];
        const result: Record<string, any>[] = [];
        sortedRawDates.forEach((date) => {
            const entry: Record<string, any> = { date };
            categories.forEach((cat) => {
                const value = getRawValue(cat, date);
                entry[cat] = value;
            });
            result.push(entry);
        });
        return result;
    }, [rawMaterialData, sortedRawDates]);

    const rawChartConfig = {
        "palm kernel": {
            label: "palm kernel",
            color: "var(--chart-1)",
        },
        "fresh fruit bunches": {
            label: "fresh fruit bunches",
            color: "var(--chart-2)",
        },
        "local crude palm oil": {
            label: "local crude palm oil",
            color: "var(--chart-3)",
        },
    };

    const renderRawChangeBadge = (change: number | null) => {
        if (change === null) return null;
        const rounded = change.toFixed(1);
        return (
            <Badge
                variant="outline"
                className={`gap-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
                {change >= 0 ? (
                    <IconTrendingUp className="size-4" />
                ) : (
                    <IconTrendingDown className="size-4" />
                )}
                {rounded}%
            </Badge>
        );
    };

    return (
        <section className="p-6 space-y-4">
            {/* MPOB Section */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-1">
                    MPOB Statistics
                </h2>
                <p className="text-stone-800 dark:text-stone-400 text-sm mb-4">
                    Malaysian Palm Oil Board (MPOB) monthly statistics on palm oil production,
                    export, import and stock levels.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                    {/* Production Card */}
                    <Card className="@container/card">
                        <CardHeader className="flex items-center justify-between">
                            <div>
                                <CardDescription>Palm Oil Production</CardDescription>
                                <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {getMpobValue("Crude Palm Oil Production", latestMpobDate).toLocaleString()} MT
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground mt-1">
                                    {latestMpobDate}
                                </CardDescription>
                            </div>
                            {renderMpobChangeBadge(calcMpobChange("Crude Palm Oil Production"))}
                        </CardHeader>
                    </Card>

                    <div className="grid grid-cols-[1.1fr_1fr] gap-4">
                        {/* Export Card */}
                        <Card className="@container/card">
                            <CardHeader className="flex items-center justify-between">
                                <div>
                                    <CardDescription>Palm Oil Export</CardDescription>
                                    <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {getMpobValue("Palm Oil Export", latestMpobDate).toLocaleString()} MT
                                    </CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground mt-1">
                                        {latestMpobDate}
                                    </CardDescription>
                                </div>
                                {renderMpobChangeBadge(calcMpobChange("Palm Oil Export"))}
                            </CardHeader>
                        </Card>

                        {/* Import Card */}
                        <Card className="@container/card">
                            <CardHeader className="flex items-center justify-between">
                                <div>
                                    <CardDescription>Palm Oil Import</CardDescription>
                                    <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                        {getMpobValue("Palm Oil Import", latestMpobDate).toLocaleString()} MT
                                    </CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground mt-1">
                                        {latestMpobDate}
                                    </CardDescription>
                                </div>
                                {renderMpobChangeBadge(calcMpobChange("Palm Oil Import"))}
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Mini Commodity Price Cards (Raw Material Prices) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Fresh Fruit Bunches */}
                        {(() => {
                            const change = calcRawChange("fresh fruit bunches");
                            const color = change && change >= 0 ? "#16a34a" : "#dc2626"; // green/red
                            return (
                                <Card className="@container/card">
                                    <CardHeader className="flex justify-between items-start pb-2">
                                        <div className="flex-1 min-w-0">
                                            <CardDescription className="text-sm leading-tight whitespace-nowrap">
                                                Fresh Fruit Bunches
                                            </CardDescription>
                                            <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl leading-tight">
                                                RM {getRawValue("fresh fruit bunches", latestRawDate).toLocaleString()}
                                            </CardTitle>
                                        </div>
                                        <div className="ml-2 shrink-0">
                                            {renderRawChangeBadge(change)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={rawChartConfig}>
                                            <AreaChart
                                                accessibilityLayer
                                                data={rawChartData}
                                                margin={{ left: 12, right: 12 }}
                                            >
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <defs>
                                                    <linearGradient id="fillFreshFruitBunches" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    dataKey="fresh fruit bunches"
                                                    type="natural"
                                                    fill="url(#fillFreshFruitBunches)"
                                                    fillOpacity={0.4}
                                                    stroke={color}
                                                    stackId="a"
                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* Palm Kernel */}
                        {(() => {
                            const change = calcRawChange("palm kernel");
                            const color = change && change >= 0 ? "#16a34a" : "#dc2626";
                            return (
                                <Card className="@container/card">
                                    <CardHeader className="flex justify-between items-start pb-2">
                                        <div className="flex-1 min-w-0">
                                            <CardDescription className="text-sm leading-tight whitespace-nowrap">
                                                Palm Kernel
                                            </CardDescription>
                                            <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl leading-tight">
                                                RM {getRawValue("palm kernel", latestRawDate).toLocaleString()}
                                            </CardTitle>
                                        </div>
                                        <div className="ml-2 shrink-0">
                                            {renderRawChangeBadge(change)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={rawChartConfig}>
                                            <AreaChart
                                                accessibilityLayer
                                                data={rawChartData}
                                                margin={{ left: 12, right: 12 }}
                                            >
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <defs>
                                                    <linearGradient id="fillPalmKernel" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    dataKey="palm kernel"
                                                    type="natural"
                                                    fill="url(#fillPalmKernel)"
                                                    fillOpacity={0.4}
                                                    stroke={color}
                                                    stackId="a"
                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* Local Crude Palm Oil */}
                        {(() => {
                            const change = calcRawChange("local crude palm oil");
                            const color = change && change >= 0 ? "#16a34a" : "#dc2626";
                            return (
                                <Card className="@container/card">
                                    <CardHeader className="flex justify-between items-start pb-2">
                                        <div className="flex-1 min-w-0">
                                            <CardDescription className="text-sm leading-tight whitespace-nowrap">
                                                Crude Palm Oil
                                            </CardDescription>
                                            <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl leading-tight">
                                                RM {getRawValue("local crude palm oil", latestRawDate).toLocaleString()}
                                            </CardTitle>
                                        </div>
                                        <div className="ml-2 shrink-0">
                                            {renderRawChangeBadge(change)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={rawChartConfig}>
                                            <AreaChart
                                                accessibilityLayer
                                                data={rawChartData}
                                                margin={{ left: 12, right: 12 }}
                                            >
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <defs>
                                                    <linearGradient id="fillLocalCrudePalmOil" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <Area
                                                    dataKey="local crude palm oil"
                                                    type="natural"
                                                    fill="url(#fillLocalCrudePalmOil)"
                                                    fillOpacity={0.4}
                                                    stroke={color}
                                                    stackId="a"
                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            );
                        })()}
                    </div>
                </div>
                {/* Right Column: MPOB Chart */}
                <div>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Palm Oil Stock Trends</CardTitle>
                            <CardDescription>Last 6 months of MPOB statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={mpobChartConfig}>
                                <BarChart accessibilityLayer data={mpobChartData}>
                                    <CartesianGrid vertical={false} />
                                    <Legend />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dashed" />}
                                    />
                                    {Object.keys(mpobChartConfig).map((key) => (
                                        <Bar
                                            key={key}
                                            dataKey={key}
                                            fill={mpobChartConfig[key as keyof typeof mpobChartConfig].color}
                                            radius={4}
                                        />
                                    ))}
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-1">
                    External Statistics
                </h2>
                <p className="text-stone-800 dark:text-stone-400 text-sm mb-4">
                    Navigate Soybean (a Palm Oil substitute), diesel and Shanghai Container Freight Prices.
                </p>
            </div>
            <ExternalToggleChart />


        </section>
    );
}