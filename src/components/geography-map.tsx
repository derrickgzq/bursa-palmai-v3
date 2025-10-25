"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Label, Legend} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { MapPin, Factory, Sun, Wind } from "lucide-react";

interface Plantation {
  company_name: string;
  parent_company: string;
  entity: string;
  latitude: number;
  longitude: number;
  certified_area: number;
  planted_area: number;
  certified_area_pct: number;
  nearest_station: string;
  distance_km: number;
  summary_forecast: string;
  color: string;
  min_temp: number;
  max_temp: number;
  mean_wind_speed_10m: number;
  wind_risk: string;
  date: string;
}

export function GeographyMap() {
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Plantation | null>(null);
  const [data, setData] = useState<Plantation[]>([]);
  const [dateIndex, setDateIndex] = useState(0);

  const position: [number, number] = [3.8, 102.3];

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/mspo-certified-entities")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error(err));
  }, []);

  const dates = useMemo(() => Array.from(new Set(data.map((d) => d.date))).sort(), [data]);
  const selectedDate = dates[dateIndex];
  const filteredData = useMemo(() => data.filter((d) => d.date === selectedDate), [data, selectedDate]);
  const selectedCompanyForDate = useMemo(() => {
    if (!selectedCompany || !selectedDate) return null;
    return filteredData.find((d) => d.entity === selectedCompany.entity) || null;
  }, [filteredData, selectedCompany, selectedDate]);

  return (
    <div className="relative h-[650px] w-full rounded-md overflow-hidden">
      {/* Map */}
      <MapContainer center={position} zoom={8} scrollWheelZoom className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AnimatePresence>
          {filteredData.map((p, i) => (
            <CircleMarker
              key={`${p.entity}-${i}`}
              center={[p.latitude, p.longitude]}
              radius={5}
              pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.4 }}
              eventHandlers={{ click: () => { setSelectedCompany(p); setOpen(true); } }}
            />
          ))}
        </AnimatePresence>
      </MapContainer>

      {/* Date Slider */}
      {dates.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[40%] sm:w-[30%] md:w-[20%] bg-background/80 backdrop-blur-md p-3 rounded-lg shadow-md z-10">
          <p className="text-center text-sm font-medium mb-2">
            {new Date(selectedDate).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <Slider value={[dateIndex]} onValueChange={(val) => setDateIndex(val[0])} min={0} max={dates.length - 1} step={1} />
        </div>
      )}

      {/* Sliding Panel */}
      <AnimatePresence>
        {open && selectedCompanyForDate && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full sm:w-96 bg-background/95 backdrop-blur-lg shadow-xl z-50 p-4 border-l border-border rounded-l-lg overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Factory className="h-10 w-10 text-foreground" />
                <span className="font-bold text-lg">{selectedCompanyForDate.entity}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>✕</Button>
            </div>

            {/* Company Info */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Company</h2>
              <p className="text-base font-medium">{selectedCompanyForDate.company_name}</p>

              <h2 className="text-sm font-semibold text-muted-foreground mt-2">Parent Company</h2>
              <p className="text-base font-medium">{selectedCompanyForDate.parent_company}</p>
            </div>

            {/* Certified vs Planted Area */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">MSPO Certification</h2>

              {/* Chart */}
              <Card className="mb-2">
                <CardContent className="flex justify-center items-center py-4">
                  <ChartContainer
                    config={{
                      Certified: { label: "Certified", color: "var(--green-500)" },
                      Planted: { label: "Planted", color: "var(--gray-300)" },
                    }}
                    className="w-full h-[150px] sm:h-[200px]" // bigger container
                  >
                    <PieChart width={250} height={250}>  {/* match container */}
                      <Pie
                        data={[
                          { name: "Certified", value: selectedCompanyForDate.certified_area, fill: "#22c55e" },
                          { name: "Planted", value: selectedCompanyForDate.planted_area - selectedCompanyForDate.certified_area, fill: "#3278e1ff" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50} // bigger inner hole
                        outerRadius={80} // bigger donut
                        startAngle={90}
                        endAngle={450}
                      >
                        <Legend />
                        <Label
                          content={({ viewBox }) => {
                            if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="text-lg font-bold fill-black dark:fill-white"
                                >
                                  {selectedCompanyForDate.certified_area_pct}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="text-xs fill-gray-500 dark:fill-gray-300"
                                >
                                  Certified
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Numbers / Legend */}
              <div className="flex flex-col items-center gap-1 mt-2">
                {/* Numbers */}
                <div className="text-2xl font-semibold text-center">
                  {selectedCompanyForDate.certified_area} / {selectedCompanyForDate.planted_area}
                </div>

                {/* Labels */}
                <div className="text-xs text-muted-foreground text-center">
                  Certified Area (ha) / Planted Area (ha)
                </div>
              </div>
            </div>

            {/* Weather Forecast */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Weather Forecast</h2>
              <div className="flex items-center justify-between">
                <Sun className="h-8 w-8 text-yellow-500" />
                <div className="flex flex-col gap-1">
                  <div className="flex gap-4">
                    <div>Min: {selectedCompanyForDate.min_temp}°C</div>
                    <div>Max: {selectedCompanyForDate.max_temp}°C</div>
                  </div>
                  <div>{new Date(selectedCompanyForDate.date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Wind Risk */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Wind Risk</h2>
              <div className="flex items-center justify-between">
                <Wind
                  className={`h-10 w-10 ${selectedCompanyForDate.wind_risk === "low"
                    ? "text-green-500"
                    : selectedCompanyForDate.wind_risk === "medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                    }`}
                />
                <div className="text-base font-medium">{selectedCompanyForDate.mean_wind_speed_10m.toFixed(2)} m/s</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
