import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const news = [
  {
    title: "Palm Oil Prices Surge Amid Global Demand",
    summary: "Palm oil futures rose 2.5% this week as global demand continues to outpace supply.",
    source: "Reuters",
    date: "2024-06-18",
    sentiment: "Positive",
  },
  {
    title: "Heavy Rains Cause Supply Disruption",
    summary: "Flooding in key plantation regions has led to temporary supply chain disruptions.",
    source: "Bloomberg",
    date: "2024-06-17",
    sentiment: "Negative",
  },
  {
    title: "Malaysia Eyes New Export Markets",
    summary: "Malaysia is exploring new export markets to diversify palm oil sales.",
    source: "The Star",
    date: "2024-06-16",
    sentiment: "Neutral",
  },
]

export function NewsCards() {
  return (
    <div className="flex flex-col gap-4">
      {news.map((item, idx) => (
        <Card key={idx} className="flex flex-col justify-between h-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
            <Badge
              variant="outline"
              className={
                item.sentiment === "Positive"
                  ? "border-green-600 text-green-600"
                  : item.sentiment === "Negative"
                  ? "border-red-600 text-red-600"
                  : "border-muted-foreground text-muted-foreground"
              }
            >
              {item.sentiment}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{item.summary}</div>
          </CardContent>
          <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{item.source}</span>
            <span>{item.date}</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}