"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Label, Legend, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Home, Factory, Sun, CloudRain, CloudLightning, Wind, Haze, Waves, Droplets } from "lucide-react";
import { WiEarthquake } from 'react-icons/wi';
import { BsThermometerSun } from 'react-icons/bs';

interface Plantation {
  company_name: string;
  parent_company: string;
  entity: string;
  mpobl_license_number: string;
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
  earthquake_availability: string;
  earthquake_origin: string;
  earthquake_magnitude: number;
  earthquake_origin_distance_km: number;
  date: string;
}

export function GeographyMap() {
  const [open, setOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Plantation | null>(null);
  const [data, setData] = useState<Plantation[]>([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [loading, setLoading] = useState(true); // track loading state

  const position: [number, number] = [3.8, 102.3];

  function HomeButton({ position, zoom }: { position: [number, number]; zoom: number }) {
    const map = useMap();

    return (
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.setView(position, zoom)}
        className="absolute bottom-28 left-4 z-[1000] shadow-md rounded-full p-2 bg-background/90 backdrop-blur-sm border"
        title="Reset View"
      >
        <Home className="h-4 w-4" />
      </Button>
    );
  }

  // Fetch data
  useEffect(() => {
    setLoading(true); // start loading
    fetch("http://127.0.0.1:8000/api/mspo-certified-entities")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error(err));
  }, []);

  const dates = useMemo(() => Array.from(new Set(data.map((d) => d.date))).sort(), [data]);
  const selectedDate = dates[dateIndex] || "";
  const filteredData = useMemo(() => data.filter((d) => d.date === selectedDate), [data, selectedDate]);

  // Stop loading when filteredData for selectedDate is ready
  useEffect(() => {
    if (data.length > 0 && filteredData.length > 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [data, filteredData]);

  const selectedCompanyForDate = useMemo(() => {
    if (!selectedCompany || !selectedDate) return null;
    return filteredData.find((d) => d.entity === selectedCompany.entity) || null;
  }, [filteredData, selectedCompany, selectedDate]);

  const forecastText = selectedCompanyForDate?.summary_forecast?.toLowerCase() || "";

  let WeatherIcon = Sun;
  let iconColor = "green";

  if (["tiada hujan", "no rain", "cerah", "clear"].some(word => forecastText.includes(word))) {
    WeatherIcon = Sun;
    iconColor = "green-500";
  } else if (["ribut petir", "thunderstorm"].some(word => forecastText.includes(word))) {
    WeatherIcon = CloudLightning;
    iconColor = "red-500";
  } else if (["hujan", "rain"].some(word => forecastText.includes(word))) {
    WeatherIcon = CloudRain;
    iconColor = "yellow-500";
  } else if (["berangin", "windy"].some(word => forecastText.includes(word))) {
    WeatherIcon = Wind;
    iconColor = "yellow-500";
  } else if (["berjerebu", "hazy", "jerebu"].some(word => forecastText.includes(word))) {
    WeatherIcon = Haze;
    iconColor = "gray-500";
  } else {
    WeatherIcon = Sun;
    iconColor = "green-500";
  }

  return (
    <div className="relative h-[650px] w-full rounded-md overflow-hidden">
      {/* Map */}
      <MapContainer center={position} zoom={8} scrollWheelZoom className="h-full w-full z-0 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 z-20">
            <div className="w-1/2">
              <Progress value={0} className="h-2" />
              <p className="text-center mt-2 text-sm text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        )}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Home Button */}
        <HomeButton position={position} zoom={8} />

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
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">MSPO Certification ({selectedCompanyForDate.mpobl_license_number})</h2>
              {/* Chart */}
              <Card className="mb-2">
                <CardContent className="flex justify-center items-center py-4">
                  <ChartContainer
                    config={{
                      Certified: { label: "Certified", color: "var(--green-500)" },
                      Planted: { label: "Planted", color: "var(--gray-300)" },
                    }}
                    className="w-full h-[150px] sm:h-[200px]"
                  >
                    <PieChart width={250} height={250}>
                      <Pie
                        data={[
                          { name: "Certified", value: selectedCompanyForDate.certified_area, fill: "#22c55e" },
                          { name: "Planted", value: selectedCompanyForDate.planted_area, fill: "#3278e1ff" },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={450}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="text-lg font-bold fill-black dark:fill-white">
                                  {selectedCompanyForDate.certified_area_pct}%
                                </tspan>
                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="text-xs fill-gray-500 dark:fill-gray-300">
                                  Certified
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Numbers / Legend */}
              <div className="flex flex-col items-center gap-1 mt-2">
                <div className="text-xl font-semibold text-center">
                  {selectedCompanyForDate.certified_area} / {selectedCompanyForDate.planted_area}
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Certified Area (ha) / Planted Area (ha)
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Weather Forecast</h2>
              <div className="flex items-center gap-4">
                <WeatherIcon className={`h-12 w-12 text-${iconColor} flex-shrink-0`} />
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">{selectedCompanyForDate.summary_forecast}</div>
                  <div className="text-xs text-muted-foreground">
                    Min: {selectedCompanyForDate.min_temp}°C | Max: {selectedCompanyForDate.max_temp}°C
                  </div>
                  <div className="text-xs text-muted-foreground">
                    From {selectedCompanyForDate.nearest_station} ({selectedCompanyForDate.distance_km} km) at {new Date(selectedCompanyForDate.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Wind Risk */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Wind Risk</h2>
              <div className="flex items-center gap-4">
                <Wind
                  className={`h-12 w-12 flex-shrink-0 ${selectedCompanyForDate?.wind_risk === "low"
                    ? "text-green-500"
                    : selectedCompanyForDate?.wind_risk === "medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                    }`}
                />
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">
                    {selectedCompanyForDate?.wind_risk?.charAt(0).toUpperCase() + selectedCompanyForDate?.wind_risk?.slice(1) || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCompanyForDate?.mean_wind_speed_10m.toFixed(2) || "0.00"} m/s
                  </div>
                </div>
              </div>
            </div>

            {/* Aqueduct */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Aqueduct Risk</h2>

              {/* Coastal Flood Risk */}
              <div className="flex items-center gap-4 mb-3">
                <Waves className="h-12 w-12 flex-shrink-0 text-foreground" />
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">Low</div>
                  <div className="text-xs text-muted-foreground">Coastal Flood Risk</div>
                </div>
              </div>

              {/* Riverine Flood Risk */}
              <div className="flex items-center gap-4 mb-3">
                <Droplets className="h-12 w-12 flex-shrink-0 text-foreground" />
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">Low</div>
                  <div className="text-xs text-muted-foreground">Riverine Flood Risk</div>
                </div>
              </div>

              {/* Drought Risk */}
              <div className="flex items-center gap-4">
                <BsThermometerSun className="h-12 w-12 flex-shrink-0 text-foreground" />
                <div className="flex flex-col gap-1">
                  <div className="text-base font-medium">Low</div>
                  <div className="text-xs text-muted-foreground">Drought Risk</div>
                </div>
              </div>
            </div>
            {/* Earthquake Section */}
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">Earthquake</h2>

              {selectedCompanyForDate?.earthquake_availability === "Earthquake within 300km radius" ? (
                <div className="flex items-center gap-4">
                  <WiEarthquake
                    className={`h-12 w-12 flex-shrink-0 ${selectedCompanyForDate?.earthquake_magnitude >= 6
                        ? "text-red-500"
                        : selectedCompanyForDate?.earthquake_magnitude >= 5
                          ? "text-orange-500"
                          : "text-yellow-500"
                      }`}
                  />
                  <div className="flex flex-col gap-1">
                    <div className="text-base font-medium">
                      Magnitude {selectedCompanyForDate?.earthquake_magnitude}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Origin: {selectedCompanyForDate?.earthquake_origin}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Distance: {selectedCompanyForDate?.earthquake_origin_distance_km?.toFixed(1)} km
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <WiEarthquake className="h-12 w-12 flex-shrink-0 text-gray-400" />
                  <div className="flex flex-col gap-1">
                    <div className="text-base font-medium">No recent earthquake nearby</div>
                    <div className="text-xs text-muted-foreground">All clear in this area</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
