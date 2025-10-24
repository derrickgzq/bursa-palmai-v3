"use client"

import { useEffect, useState } from "react"
import { ResponsiveContainer, Sankey, Tooltip } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SankeyData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

interface Props {
  companyShortName: string
}

export function CompanyFinancials({ companyShortName }: Props) {
  const [data, setData] = useState<SankeyData | null>(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/company/sankey/${companyShortName}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching Sankey data:", err))
  }, [companyShortName])

  if (!data) {
    return <Skeleton className="h-80 w-full rounded-md" />
  }

  // Recharts Sankey expects the same keys, but we can ensure it's consistent
  const chartData = {
    nodes: data.nodes.map((n) => ({ name: n.name })),
    links: data.links.map((l) => ({
      source: l.source,
      target: l.target,
      value: l.value,
    })),
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sankey Flow — {companyShortName}</CardTitle>
      </CardHeader>
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={chartData}
            nodePadding={30}
            nodeWidth={20}
            margin={{ left: 50, right: 50, top: 20, bottom: 20 }}
            link={{
              stroke: "var(--chart-3)",
              strokeOpacity: 0.4,
            }}
            node={{
              stroke: "var(--border)",
              fill: "var(--chart-1)",
            }}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
              formatter={(value: number, name: string, props: any) => {
                // Find the corresponding link info
                const link = chartData.links[props?.index ?? 0]
                if (!link) return [value]
                const sourceName = chartData.nodes[link.source]?.name
                const targetName = chartData.nodes[link.target]?.name
                return [`${value.toLocaleString()}`, `${sourceName} → ${targetName}`]
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
