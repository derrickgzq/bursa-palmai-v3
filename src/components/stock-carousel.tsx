"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface StockItem {
  name: string;
  logo: string;
  price: string;
  change: string;
  up: boolean;
}

const companies = [
  { name: "IOI Corporation", short: "IOICORP", logo: "src/assets/images/ioicorp_logo.png" },
  { name: "Kuala Lumpur Kepong", short: "KLK", logo: "src/assets/images/klk_logo.png" },
  { name: "Sime Darby Guthrie", short: "SDG", logo: "src/assets/images/sdg_logo.png" },
  { name: "Hap Seng Plantations", short: "HSPLANT", logo: "src/assets/images/hsplant_logo.png" },
  { name: "Jaya Tiasa Holdings", short: "JTIASA", logo: "src/assets/images/jtiasa_logo.png" },
  { name: "Innoprise Plantations", short: "INNO", logo: "src/assets/images/inno_logo.png" },
  { name: "Genting Plantations", short: "GENP", logo: "src/assets/images/genp_logo.png" },
  { name: "TSH Resources", short: "TSH", logo: "src/assets/images/tsh_logo.png" },
];

export function StockCarousel() {
  const [stockData, setStockData] = React.useState<StockItem[] | null>(null);

  React.useEffect(() => {
    async function loadStocks() {
      const results: StockItem[] = [];

      for (const c of companies) {
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/shareprice/${c.short}`);
          const json = await res.json();

          if (!json.prices || json.prices.length === 0) continue;

          const latest = json.prices[json.prices.length - 1];
          const prev = json.prices[json.prices.length - 2] ?? latest;

          const change = (((latest - prev) / prev) * 100).toFixed(2);

          results.push({
            name: c.name,
            logo: c.logo,
            price: `RM ${latest.toFixed(2)}`,
            change: `${change}%`,
            up: Number(change) >= 0,
          });
        } catch (err) {
          console.error("Error fetching stock:", c.short, err);
        }
      }

      setStockData(results);
    }

    loadStocks();
  }, []);

  if (!stockData) return <p className="text-center text-sm">Loading stock prices...</p>;

  return (
    <div className="relative">
      <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {stockData.map((stock, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <Card className="bg-card text-card-foreground border border-border shadow-md hover:shadow-lg transition">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={stock.logo}
                      alt={`${stock.name} logo`}
                      className="w-12 h-12 object-contain rounded-md"
                    />
                    <CardTitle className="text-base font-semibold">{stock.name}</CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={`gap-1 ${stock.up ? "text-green-500" : "text-red-500"}`}
                  >
                    {stock.up ? (
                      <IconTrendingUp className="size-4" />
                    ) : (
                      <IconTrendingDown className="size-4" />
                    )}
                    {stock.change}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stock.price}</div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
