"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Treemap, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

const data = [
  { name: "IOI Corp", size: 400 },
  { name: "KLK", size: 300 },
  { name: "Sime Darby", size: 200 },
  { name: "Jaya Tiasa", size: 100 },
  { name: "Inno", size: 50 },
  { name: "FGV Holdings", size: 180 },
  { name: "Boustead Plantations", size: 90 },
  { name: "United Plantations", size: 120 },
  { name: "TDM Berhad", size: 70 },
  { name: "Sarawak Oil Palms", size: 110 },
  { name: "Hap Seng Plantations", size: 60 },
  { name: "TH Plantations", size: 85 },
  { name: "Shin Yang", size: 40 },
  { name: "IJM Plantations", size: 95 },
  { name: "Cepatwawasan", size: 35 },
  { name: "Kim Loong Resources", size: 65 },
  { name: "NPC Resources", size: 30 },
  { name: "TSH Resources", size: 150 },
  { name: "Far East Holdings", size: 55 },
  { name: "Golden Land", size: 25 },
];

// Define chart config colors
const chartConfig = {
  ioicorp: { label: "IOI Corp", color: "var(--chart-1)" },
  klk: { label: "KLK", color: "var(--chart-2)" },
  simedarby: { label: "Sime Darby", color: "var(--chart-3)" },
  jayatiasa: { label: "Jaya Tiasa", color: "var(--chart-4)" },
  inno: { label: "Inno", color: "var(--chart-5)" },
}

export function CompanyTreemapCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Company Market Treemap</CardTitle>
        <CardDescription>
          Top listed plantation companies by market cap
        </CardDescription>
      </CardHeader>

      <CardContent className="relative flex-1">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={260}>
            <Treemap
              data={data}
              dataKey="size"
              nameKey="name"
              stroke="var(--border)"
              fill="url(#gradient-1)"
              content={<CustomTreemapNode />}
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            </Treemap>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <div className="px-6 pb-4 text-sm text-muted-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[color:var(--chart-2)]" />
        Market leaders continue to dominate the plantation sector.
      </div>
    </Card>
  )
}

// 🧩 Custom Node Renderer with Gradients
function CustomTreemapNode(props: any) {
  const { x, y, width, height, name, size, index } = props
  const colorTokens = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]
  const color = colorTokens[index % colorTokens.length]
  const gradientId = `grad-${index}`

  return (
    <g>
      {/* Define a linear gradient for each node */}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <stop offset="100%" stopColor="var(--background)" stopOpacity={0.2} />
        </linearGradient>
      </defs>

      {/* Rectangle with gradient fill */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        stroke="var(--border)"
        rx={6}
        className="transition-all duration-200 hover:opacity-90 hover:scale-[1.02] origin-center"
      />

      {/* Labels */}
      {width > 60 && height > 25 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 4}
            textAnchor="middle"
            fill="var(--foreground)"
            className="text-xs font-medium"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            className="text-[10px]"
          >
            {size}
          </text>
        </>
      )}
    </g>
  )
}
