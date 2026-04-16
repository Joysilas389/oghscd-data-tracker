"use client";
import { useEffect, useRef } from "react";

interface Marker {
  locality: string;
  lat: number;
  lng: number;
  count: number;
  male: number;
  female: number;
}

export default function MapView({ markers }: { markers: Marker[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([5.9264, -0.9875], 10);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      markers.forEach(m => {
        const radius = Math.max(10, Math.min(40, m.count * 8));
        const circle = L.circleMarker([m.lat, m.lng], {
          radius,
          fillColor: "#1a5276",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.75,
        }).addTo(map);

        circle.bindPopup(`
          <div style="min-width:160px">
            <strong style="color:#1a5276">📍 ${m.locality}</strong><br/>
            <hr style="margin:4px 0"/>
            <b>Patients:</b> ${m.count}<br/>
            <b>Male:</b> ${m.male} &nbsp; <b>Female:</b> ${m.female}<br/>
            <small style="color:#999">Centroid-level only</small>
          </div>
        `);

        L.marker([m.lat, m.lng])
          .addTo(map)
          .bindTooltip(`${m.locality}: ${m.count}`, { permanent: false });
      });

      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} style={{ height: 450, width: "100%", borderRadius: "0 0 8px 8px" }} />
    </>
  );
}
