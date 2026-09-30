// Leaflet map showing incidents and clusters
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import { SEVERITY, CONFIDENCE } from "../data/enums";

const SEVERITY_COLORS = {
  1: "#10b981",
  2: "#f59e0b",
  3: "#e02424",
  4: "#7f1d1d",
};

const BRAND_COLOR = "#1a66db";

function FlyToController({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 10, { duration: 1.2 });
    } else {
      map.flyTo([7.8774, 80.6989], 8, { duration: 1.2 });
    }
  }, [coords, map]);

  return null;
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function SriLankaMap({ incidents = [], clusters = [], districtCoords, height = "400px" }) {
  const center = [7.8774, 80.6989];
  const zoom = 8;
  const containerRef = useRef(null);

  const validIncidents = incidents.filter(
    (inc) =>
      inc.latitude != null &&
      inc.longitude != null &&
      typeof inc.latitude === "number" &&
      typeof inc.longitude === "number" &&
      !isNaN(inc.latitude) &&
      !isNaN(inc.longitude)
  );

  const validClusters = clusters.filter(
    (clt) =>
      clt.centroid_lat != null &&
      clt.centroid_lng != null &&
      typeof clt.centroid_lat === "number" &&
      typeof clt.centroid_lng === "number"
  );

  return (
    <div className="card overflow-hidden" style={{ height }} ref={containerRef}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <MapResizeFix />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <FlyToController coords={districtCoords} />

        {validIncidents.map((inc) => {
          const color = SEVERITY_COLORS[inc.severity_level] || BRAND_COLOR;
          const radius = inc.severity_level >= 4 ? 14 : inc.severity_level === 3 ? 10 : inc.severity_level === 2 ? 8 : 6;
          const confLabel =
            CONFIDENCE[inc.confidence_code]?.label || inc.confidence_code || "Unknown";

          return (
            <CircleMarker
              key={inc.id}
              center={[inc.latitude, inc.longitude]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">{inc.id}</p>
                  <p>Severity: {SEVERITY[inc.severity_level]?.label || inc.severity_level}</p>
                  <p>Status: {inc.status}</p>
                  <p>Confidence: {confLabel}</p>
                  <p>People: {inc.people_count}</p>
                  {inc.landmark_name && <p>Landmark: {inc.landmark_name}</p>}
                  <p className="text-gray-400 mt-1">
                    {inc.latitude != null ? Number(inc.latitude).toFixed(4) : "—"}, {inc.longitude != null ? Number(inc.longitude).toFixed(4) : "—"}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {validClusters.map((clt) => (
          <CircleMarker
            key={clt.id}
            center={[clt.centroid_lat, clt.centroid_lng]}
            radius={14}
            pathOptions={{
              color: BRAND_COLOR,
              fillColor: BRAND_COLOR,
              fillOpacity: 0.15,
              weight: 2,
              dashArray: "4 4",
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">{clt.name}</p>
                <p>Members: {clt.member_count}</p>
                <p>Radius: {clt.radius_meters}m</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
