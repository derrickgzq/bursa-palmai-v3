import { IconTrendingUp, IconTrendingDown, IconAlertTriangle } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {/* News Sentiment Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>News Sentiment</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Positive
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-4 text-green-600" />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Sentiment up this week <IconTrendingUp className="size-4 text-green-600" />
          </div>
          <div className="text-muted-foreground">
            Based on 120 news articles
          </div>
        </CardFooter>
      </Card>
      {/* Price Momentum Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Price Momentum</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            RM 4,250
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingDown className="size-4 text-red-600" />
              -2.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Price down this month <IconTrendingDown className="size-4 text-red-600" />
          </div>
          <div className="text-muted-foreground">
            Palm oil futures, last 30 days
          </div>
        </CardFooter>
      </Card>
      {/* Weather Warnings Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Weather Warnings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3 Active Alerts
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconAlertTriangle className="size-4 text-yellow-600" />
              Severe
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Flood risk in Johor <IconAlertTriangle className="size-4 text-yellow-600" />
          </div>
          <div className="text-muted-foreground">
            Updated 2 hours ago
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}