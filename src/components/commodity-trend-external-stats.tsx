"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts";
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
import type { ChartConfig } from "@/components/ui/chart"

const headerText = {
  diesel: {
    title: "Diesel Prices",
    desc: "Latest diesel retail price trend",
  },
  freight: {
    title: "Container Freight Index",
    desc: "Global shipping cost trend",
  },
  fertilizer: {
    title: "Fertilizer Prices",
    desc: "Agricultural input market trend",
  },
} as const;

export function ExternalToggleChart() {
  const [activeChart, setActiveChart] = React.useState<
    "diesel" | "freight" | "fertilizer"
  >("diesel");
  const [dieselData, setDieselData] = React.useState<any[]>([]);
  const [freightData, setFreightData] = React.useState<any[]>([]);
  const [fertilizerData, setFertilizerData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  /* ------------------------------------------------------------------ */
  /*  FETCH ALL DATA (parallel)                                         */
  /* ------------------------------------------------------------------ */
  React.useEffect(() => {
    async function fetchAll() {
      try {
        const [dRes, fRes, rRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/diesel-prices"),
          fetch("http://127.0.0.1:8000/api/container-freight-index"),
          fetch("http://127.0.0.1:8000/api/raw-material-prices"),
        ]);

        const dieselJson = await dRes.json();
        const freightJson = await fRes.json();
        const rawJson = await rRes.json();

        /* ---- Diesel ---- */
        const diesel = dieselJson
          .map((d: any) => ({
            date: d.date,
            diesel: d.diesel,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        /* ---- Freight ---- */
        const freight = Object.values(
          freightJson.reduce((acc: any, cur: any) => {
            if (!acc[cur.date]) acc[cur.date] = { date: cur.date };
            acc[cur.date][cur.category] = cur.value;
            return acc;
          }, {})
        ).sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        /* ---- Fertilizer (only the 5 categories) ---- */
        const fertCats = [
          "dap-fertilizer",
          "potassium-chloride",
          "rock-phosphate",
          "triple-superphosphate",
          "urea",
        ];

        const fertMap = rawJson.reduce((acc: any, cur: any) => {
          if (fertCats.includes(cur.category)) {
            if (!acc[cur.date]) acc[cur.date] = { date: cur.date };
            acc[cur.date][cur.category] = Number(cur.value);
          }
          return acc;
        }, {});

        const fertilizer = Object.values(fertMap).sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setDieselData(diesel);
        setFreightData(freight);
        setFertilizerData(fertilizer);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  CHART CONFIG – must contain every dataKey                         */
  /* ------------------------------------------------------------------ */
  const chartConfig = {
    diesel: { label: "Diesel (RM/litre)", color: "var(--chart-1)" },
    freight: { label: "Freight Index", color: "var(--chart-2)" },
    fertilizer: { label: "Fertilizer (RM/tonne)", color: "var(--chart-3)" },

    "dap-fertilizer": { label: "DAP", color: "hsl(220,70%,50%)" },
    "potassium-chloride": { label: "KCl", color: "hsl(160,70%,50%)" },
    "rock-phosphate": { label: "Rock Phosphate", color: "hsl(40,70%,50%)" },
    "triple-superphosphate": { label: "TSP", color: "hsl(280,70%,50%)" },
    urea: { label: "Urea", color: "hsl(10,70%,50%)" },
  } satisfies ChartConfig;

  const currentData =
    activeChart === "diesel"
      ? dieselData
      : activeChart === "freight"
      ? freightData
      : fertilizerData;

  /* ------------------------------------------------------------------ */
  /*  TOTALS for the toggle buttons                                    */
  /* ------------------------------------------------------------------ */
  const total = React.useMemo(() => {
    return {
      diesel: dieselData.reduce((s, d) => s + (d.diesel ?? 0), 0),
      freight: freightData.reduce(
        (s, d) => s + (d["COMPOSITE INDEX"] ?? 0),
        0
      ),
      fertilizer: fertilizerData.reduce((s, d) => {
        return (
          s +
          (d["dap-fertilizer"] ?? 0) +
          (d["potassium-chloride"] ?? 0) +
          (d["rock-phosphate"] ?? 0) +
          (d["triple-superphosphate"] ?? 0) +
          (d["urea"] ?? 0)
        );
      }, 0),
    };
  }, [dieselData, freightData, fertilizerData]);

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <Card className="py-0">
      {/* ----- Header + Toggle ----- */}
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>{headerText[activeChart].title}</CardTitle>
          <CardDescription>{headerText[activeChart].desc}</CardDescription>
        </div>

        <div className="flex">
          {(["diesel", "freight", "fertilizer"] as const).map((k) => (
            <button
              key={k}
              data-active={activeChart === k}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(k)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[k].label}
              </span>
              <span className="text-lg font-bold sm:text-3xl">
                {total[k].toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      {/* ----- Chart ----- */}
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[380px] w-full"
          >
            {/* ---------------------------------------------------------- */}
            {/*  Diesel & Freight → still use Bar (single series)          */}
            {/* ---------------------------------------------------------- */}
            {activeChart === "diesel" && (
              <BarChart
                accessibilityLayer
                data={currentData}
                margin={{ left: 12, right: 12, top: 20 }}
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
                      className="w-[180px]"
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Bar
                  dataKey="diesel"
                  fill={chartConfig.diesel.color}
                  radius={6}
                />
              </BarChart>
            )}

            {activeChart === "freight" && (
              <BarChart
                accessibilityLayer
                data={currentData}
                margin={{ left: 12, right: 12, top: 20 }}
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
                      className="w-[180px]"
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Bar
                  dataKey="COMPOSITE INDEX"
                  fill={chartConfig.freight.color}
                  radius={6}
                />
              </BarChart>
            )}

            {/* ---------------------------------------------------------- */}
            {/*  Fertilizer → Stacked Gradient Area Chart                  */}
            {/* ---------------------------------------------------------- */}
            {activeChart === "fertilizer" && (
              <AreaChart
                accessibilityLayer
                data={currentData}
                margin={{ left: 12, right: 12, top: 40 }}
              >
                <defs>
                  {/* Gradient definitions – one per fertilizer */}
                  {[
                    { key: "dap-fertilizer", stop1: "#3b82f6", stop2: "#93c5fd" },
                    { key: "potassium-chloride", stop1: "#10b981", stop2: "#6ee7b7" },
                    { key: "rock-phosphate", stop1: "#f59e0b", stop2: "#fcd34d" },
                    { key: "triple-superphosphate", stop1: "#a855f7", stop2: "#e9d5ff" },
                    { key: "urea", stop1: "#ef4444", stop2: "#fca5a5" },
                  ].map((g) => (
                    <linearGradient
                      key={g.key}
                      id={`gradient-${g.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={g.stop1} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={g.stop2} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>

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
                      className="w-[240px]"
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                    />
                  }
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) =>
                    chartConfig[value as keyof typeof chartConfig]?.label ?? value
                  }
                />

                {/* Stacked areas – same order as legend */}
                {[
                  "dap-fertilizer",
                  "potassium-chloride",
                  "rock-phosphate",
                  "triple-superphosphate",
                  "urea",
                ].map((cat) => (
                  <Area
                    key={cat}
                    type="natural"
                    dataKey={cat}
                    stackId="fertilizerStack"
                    stroke={chartConfig[cat as keyof typeof chartConfig].color}
                    fillOpacity={1}
                    fill={`url(#gradient-${cat})`}
                  />
                ))}
              </AreaChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}