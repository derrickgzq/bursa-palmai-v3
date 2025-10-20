"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

const stocks = [
  {
    name: "IOI Corporation Berhad",
    logo: "src/assets/images/ioi_logo.png",
    price: "RM 4.36",
    change: "+1.2%",
    up: true,
  },
  {
    name: "Kuala Lumpur Kepong",
    logo: "src/assets/images/klk_logo.png",
    price: "RM 21.50",
    change: "-0.8%",
    up: false,
  },
  {
    name: "Sime Darby Guthire",
    logo: "src/assets/images/sdg_logo.png",
    price: "RM 4.28",
    change: "+0.5%",
    up: true,
  },
  {
    name: "Jaya Tiasa Holdings",
    logo: "src/assets/images/jtiasa_logo.png",
    price: "RM 1.16",
    change: "-0.4%",
    up: false,
  },
  {
    name: "Innoprise Plantations",
    logo: "src/assets/images/inno_logo.png",
    price: "RM 1.72",
    change: "+1.0%",
    up: true,
  },
  {
    name: "Genting Plantations",
    logo: "src/assets/images/genp_logo.png",
    price: "RM 5.89",
    change: "+15.0%",
    up: true,
  },
]

export function StockCarousel() {
  return (
    <div className="relative">
      <Carousel className="w-full max-w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {stocks.map((stock, index) => (
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
                    <CardTitle className="text-base font-semibold">
                      {stock.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={`gap-1 ${
                      stock.up ? "text-green-500" : "text-red-500"
                    }`}
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Plantation Sector
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  )
}
