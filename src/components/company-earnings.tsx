"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FinancialRecord {
  date: string;
  revenue: number;
  net_profit: number;
  net_profit_margin: number;
}
interface ChartData extends FinancialRecord {}

export function CompanyEarnings({
  companyShortName,
}: {
  companyShortName: string;
}) {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/earnings/${companyShortName}`)
      .then((r) => r.json())
      .then((raw: FinancialRecord[]) => {
        setData(
          raw.map((i) => ({
            date: i.date,
            revenue: i.revenue,
            net_profit: i.net_profit,
            net_profit_margin: i.net_profit_margin,
          }))
        );
      })
      .catch((e) => console.error(e));
  }, [companyShortName]);

  const formatValue = (val: number): string => {
    if (val >= 1_000_000_000) return `RM${(val / 1e9).toFixed(1)}B`;
    if (val <= -1_000_000_000) return `RM${(val / 1e9).toFixed(1)}B`;
    if (val >= 1_000_000) return `RM${(val / 1e6).toFixed(1)}M`;
    if (val <= -1_000_000) return `RM${(val / 1e6).toFixed(1)}M`;
    if (val >= 1_000) return `RM${(val / 1e3).toFixed(1)}K`;
    if (val <= -1_000) return `RM${(val / 1e3).toFixed(1)}K`;
    return `RM${val.toLocaleString()}`;
  };

  const chartConfig = {
    revenue: { label: "Revenue", color: "var(--chart-1)" },
    net_profit: { label: "Net Profit", color: "var(--chart-2)" },
    net_profit_margin: {
      label: "Net Profit Margin (%)",
      color: "var(--chart-3)",
    },
  } satisfies import("@/components/ui/chart").ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quarterly Earnings</CardTitle>
        <CardDescription>
          Revenue, Net Profit & Profit Margin
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full">
        <ChartContainer
          config={chartConfig}
          className="h-[420px] w-full"   
        >
          <BarChart
            data={data}
            margin={{ top: 50, right: 50, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.toLocaleString("default", {
                  month: "short",
                })} ${d.getFullYear()}`;
              }}
            />

            {/* left axis – RM (B/M) */}
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => (v >= 1e9 ? `${(v / 1e9).toFixed(0)}B` : `${(v / 1e6).toFixed(0)}M`)}
            />

            {/* right axis – % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />

            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend/>

            {/* ---------- Revenue Bar ---------- */}
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={4}
              yAxisId="left"
            >
              <LabelList
                dataKey="revenue"
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={formatValue}
              />
            </Bar>

            {/* ---------- Net Profit Bar ---------- */}
            <Bar
              dataKey="net_profit"
              fill="var(--color-net_profit)"
              radius={4}
              yAxisId="left"
            >
              <LabelList
                dataKey="net_profit"
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={formatValue}
              />
            </Bar>

            {/* ---------- Profit Margin Line ---------- */}
            <Line
              type="monotone"
              dataKey="net_profit_margin"
              stroke="var(--color-net_profit_margin)"
              strokeWidth={3}
              dot={{ fill: "var(--color-net_profit_margin)", r: 5 }}
              activeDot={{ r: 7 }}
              yAxisId="right"
            >
              <LabelList
                dataKey="net_profit_margin"
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={11}
                formatter={(v: number) => `${v}%`}
              />
            </Line>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}