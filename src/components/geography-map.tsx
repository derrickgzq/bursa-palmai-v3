// src/components/geography-map.tsx
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";

// Fix marker icon issue with Leaflet + Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export function GeographyMap() {
  const [open, setOpen] = useState(false);
  const position: [number, number] = [3.139, 101.6869];

  return (
    <div className="relative h-[600px] w-full rounded-md overflow-hidden">
      <MapContainer
        center={position}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          eventHandlers={{
            click: () => setOpen(true),
          }}
        >
          <Popup>Kuala Lumpur</Popup>
        </Marker>
      </MapContainer>

      {/* Local sliding panel anchored to map */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full sm:w-80 bg-background/95 backdrop-blur-lg shadow-xl z-10 p-4 border-l border-border rounded-l-lg"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Kuala Lumpur Insights</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              You clicked on Kuala Lumpur. Here’s where you can show:
            </p>
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>Weather forecast</li>
              <li>Nearby mills or plantations</li>
              <li>Regional palm oil insights</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
