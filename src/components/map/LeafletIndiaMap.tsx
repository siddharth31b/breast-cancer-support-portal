"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { StateReachData } from "../../services/platform-reach.service";
import { RotateCcw, ArrowLeft, Layers, MapPin } from "lucide-react";

interface LeafletIndiaMapProps {
  statesData: Record<string, StateReachData>;
  selectedStateId?: string;
  onSelectState?: (state: StateReachData) => void;
  className?: string;
}

// Complete official bounding box of India (Survey of India standard - Siachen to Indira Point)
const INDIA_BOUNDS: L.LatLngBoundsLiteral = [
  [6.75, 68.10], // South-West
  [37.10, 97.40]  // North-East
];

function normalizeStateName(name: string): string {
  if (!name) return "";
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n.includes("andhra")) return "andhrapradesh";
  if (n.includes("arunachal")) return "arunachalpradesh";
  if (n.includes("madhya")) return "madhyapradesh";
  if (n.includes("chhattisgarh") || n.includes("chatisgarh")) return "chhattisgarh";
  if (n.includes("maharashtra")) return "maharashtra";
  if (n.includes("delhi")) return "delhi";
  if (n.includes("karnataka")) return "karnataka";
  if (n.includes("tamil")) return "tamilnadu";
  if (n.includes("telangana")) return "telangana";
  if (n.includes("kerala")) return "kerala";
  if (n.includes("uttarpradesh")) return "uttarpradesh";
  if (n.includes("uttaranchal") || n.includes("uttarakhand")) return "uttarakhand";
  if (n.includes("bengal")) return "westbengal";
  if (n.includes("gujarat")) return "gujarat";
  if (n.includes("bihar")) return "bihar";
  if (n.includes("rajasthan")) return "rajasthan";
  if (n.includes("orissa") || n.includes("odisha")) return "odisha";
  if (n.includes("assam")) return "assam";
  if (n.includes("punjab")) return "punjab";
  if (n.includes("haryana")) return "haryana";
  if (n.includes("jharkhand")) return "jharkhand";
  if (n.includes("himachal")) return "himachalpradesh";
  if (n.includes("ladakh")) return "ladakh";
  if (n.includes("jammu") || n.includes("kashmir")) return "jammukashmir";
  if (n.includes("goa")) return "goa";
  if (n.includes("tripura")) return "tripura";
  if (n.includes("manipur")) return "manipur";
  if (n.includes("meghalaya")) return "meghalaya";
  if (n.includes("mizoram")) return "mizoram";
  if (n.includes("nagaland")) return "nagaland";
  if (n.includes("sikkim")) return "sikkim";
  return n;
}

export const LeafletIndiaMap: React.FC<LeafletIndiaMapProps> = ({
  statesData,
  selectedStateId = "AP",
  onSelectState,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const statesLayerRef = useRef<L.GeoJSON | null>(null);
  const districtsLayerRef = useRef<L.GeoJSON | null>(null);

  const [statesGeoJson, setStatesGeoJson] = useState<any>(null);
  const [allDistrictsGeoJson, setAllDistrictsGeoJson] = useState<any>(null);

  const [zoomedState, setZoomedState] = useState<{ id: string; name: string } | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    title: string;
    subtitle: string;
    detail?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Normalized map for quick lookups
  const normalizedStateMap = useMemo(() => {
    const map: Record<string, StateReachData> = {};
    Object.values(statesData).forEach(st => {
      map[normalizeStateName(st.name)] = st;
      map[st.id.toLowerCase()] = st;
    });
    return map;
  }, [statesData]);

  const findReachDataForState = useCallback((stateName: string): StateReachData | undefined => {
    const norm = normalizeStateName(stateName);
    return normalizedStateMap[norm];
  }, [normalizedStateMap]);

  // 1. Fetch State and District GeoJSON files
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetch("/india-states-official.geojson").then(res => res.json()),
      fetch("/india-districts-official.geojson").then(res => res.json())
    ])
      .then(([statesData, districtsData]) => {
        if (!isMounted) return;
        setStatesGeoJson(statesData);
        setAllDistrictsGeoJson(districtsData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      boxZoom: false,
      dragging: true,
      zoomSnap: 0.05, // Enable fractional zoom levels so map fills container tightly
      zoomDelta: 0.25
    });

    // Fit complete figure of India using exact fractional zoom
    map.fitBounds(INDIA_BOUNDS, {
      padding: [8, 8],
      animate: false
    });

    L.control.zoom({ position: "topright" }).addTo(map);
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (statesLayerRef.current && statesLayerRef.current.getBounds().isValid()) {
          mapInstanceRef.current.fitBounds(statesLayerRef.current.getBounds(), {
            padding: [8, 8],
            animate: false
          });
        }
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Zoom to a specific state and render its city/district borders
  const zoomToState = useCallback((stateName: string, stateId: string, stateBounds?: L.LatLngBounds) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setZoomedState({ id: stateId, name: stateName });

    // 1. Clear any existing district layer
    if (districtsLayerRef.current) {
      map.removeLayer(districtsLayerRef.current);
      districtsLayerRef.current = null;
    }

    // 2. Filter districts for this state
    if (allDistrictsGeoJson) {
      const normState = normalizeStateName(stateName);
      const stateDistricts = allDistrictsGeoJson.features.filter((f: any) => {
        return normalizeStateName(f.properties?.st_nm || "") === normState;
      });

      if (stateDistricts.length > 0) {
        const districtCollection = {
          type: "FeatureCollection" as const,
          features: stateDistricts
        };

        const stateData = statesData[stateId] || Object.values(statesData).find(s => normalizeStateName(s.name) === normState);

        const distLayer = L.geoJSON(districtCollection, {
          style: (feature: any) => {
            const distName = feature.properties?.district || "";
            const matchedDist = stateData?.districts?.find(
              d => d.name.toLowerCase() === distName.toLowerCase()
            );
            const hasClinicians = matchedDist && (matchedDist.clinicians > 0 || matchedDist.patients > 0);

            const isReachedDist = Boolean(hasClinicians);
            return {
              fillColor: "transparent",
              fillOpacity: 0,
              color: isReachedDist ? "#0f172a" : "#64748b",
              weight: isReachedDist ? 1.6 : 1.1,
              opacity: 1,
              dashArray: isReachedDist ? undefined : "3, 3"
            };
          },
          onEachFeature: (feature, layer) => {
            const distName = feature.properties?.district || "District";
            const matchedDist = stateData?.districts?.find(
              d => d.name.toLowerCase() === distName.toLowerCase()
            );

            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  fillColor: matchedDist ? "#0f172a" : "#e2e8f0",
                  fillOpacity: 0.8,
                  color: "#0284c7",
                  weight: 2
                });
                target.bringToFront();

                setHoveredInfo({
                  title: `${distName} (${stateName})`,
                  subtitle: matchedDist
                    ? `${matchedDist.clinicians} clinician &bull; ${matchedDist.patients} patients &bull; ${matchedDist.livesAffected || 0} lives affected`
                    : "No active clinical screening centers registered yet",
                  detail: matchedDist?.centerName ? `Center: ${matchedDist.centerName}` : undefined
                });
              },
              mouseout: () => {
                distLayer.resetStyle(layer);
                setHoveredInfo(null);
              }
            });
          }
        }).addTo(map);

        districtsLayerRef.current = distLayer;

        // Smoothly zoom into the district layer bounds
        const targetBounds = distLayer.getBounds();
        if (targetBounds.isValid()) {
          map.flyToBounds(targetBounds, {
            padding: [30, 30],
            maxZoom: 7.5,
            duration: 0.8
          });
          return;
        }
      }
    }

    // Fallback zoom if district bounds aren't available
    if (stateBounds && stateBounds.isValid()) {
      map.flyToBounds(stateBounds, {
        padding: [30, 30],
        maxZoom: 7.5,
        duration: 0.8
      });
    }
  }, [allDistrictsGeoJson, statesData]);

  // Reset to All-India National View (Shows complete India outline and state borders only)
  const handleResetToAllIndia = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove district layer
    if (districtsLayerRef.current) {
      map.removeLayer(districtsLayerRef.current);
      districtsLayerRef.current = null;
    }

    setZoomedState(null);
    setHoveredInfo(null);

    // Fly smoothly back to full national bounds using exact layer geometry
    const bounds = statesLayerRef.current?.getBounds();
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [6, 6],
        duration: 0.7
      });
    } else {
      map.flyToBounds(INDIA_BOUNDS, {
        padding: [6, 6],
        duration: 0.7
      });
    }
  }, []);

  // 3. Render National State Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !statesGeoJson) return;

    if (statesLayerRef.current) {
      map.removeLayer(statesLayerRef.current);
      statesLayerRef.current = null;
    }

    const layer = L.geoJSON(statesGeoJson, {
      style: (feature: any) => {
        const stateName = feature.properties?.st_nm || feature.properties?.name || "";
        const data = findReachDataForState(stateName);
        const hasReach = (data?.clinicians || 0) > 0;
        const isCurrentSelected = data && data.id === selectedStateId;
        const isZoomed = zoomedState && normalizeStateName(zoomedState.name) === normalizeStateName(stateName);

        // Pure outline map with BreastCare AI teal branding for active clinical regions
        const isReached = hasReach || isCurrentSelected || isZoomed;
        return {
          fillColor: "transparent",
          fillOpacity: 0,
          color: isReached ? "#005F56" : "#64748b", // BreastCare AI teal for active states, clean slate for others
          weight: isReached ? 2.0 : 1.2,
          opacity: 1
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const stateName = feature.properties?.st_nm || feature.properties?.name || "State";
        const data = findReachDataForState(stateName);

        featureLayer.on({
          mouseover: (e) => {
            if (zoomedState) return; // Don't override if zoomed into districts
            const target = e.target;
            target.setStyle({
              fillColor: "#00897B",
              fillOpacity: 0.12,
              color: "#005F56",
              weight: 2.2
            });
            target.bringToFront();

            setHoveredInfo({
              title: stateName,
              subtitle: data 
                ? `${data.clinicians} ${data.clinicians === 1 ? "clinician" : "clinicians"} • ${data.patients} patients`
                : "Click to zoom & inspect city/district boundaries"
            });
          },
          mouseout: () => {
            if (zoomedState) return;
            layer.resetStyle(featureLayer);
            setHoveredInfo(null);
          },
          click: () => {
            const stId = data?.id || normalizeStateName(stateName).slice(0, 2).toUpperCase();
            if (data && onSelectState) {
              onSelectState(data);
            }
            // Zoom in and reveal city/district borders!
            const bounds = (featureLayer as any).getBounds ? (featureLayer as any).getBounds() : undefined;
            zoomToState(stateName, stId, bounds);
          }
        });
      }
    }).addTo(map);

    statesLayerRef.current = layer;
  }, [statesGeoJson, statesData, selectedStateId, zoomedState, findReachDataForState, onSelectState, zoomToState]);

  const activeStateInfo = statesData[selectedStateId] || {
    id: selectedStateId,
    name: zoomedState?.name || "Andhra Pradesh",
    clinicians: 1,
    patients: 5,
    radiologists: 1,
    nurses: 1,
    fieldWorkers: 1,
    admins: 0,
    districts: [],
    activeCenters: []
  };

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden ${className}`}>

      {/* ──── Header: Clean, Clinical Title ──── */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Where the platform has reached
            </h3>
            {zoomedState ? (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {zoomedState.name} &bull; District Outlines Active
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">
                (Click any state to zoom in & view city borders)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Complete Survey of India boundary with interactive state & district clinical drill-down
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {zoomedState && (
            <button
              type="button"
              onClick={handleResetToAllIndia}
              className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All India View</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetToAllIndia}
            title="Reset to Full India Bounds"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ──── Map Viewport ──── */}
      <div className="relative w-full h-[580px] sm:h-[640px] lg:h-[670px] bg-white overflow-hidden">

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading official India boundaries and districts...</span>
          </div>
        )}

        {/* Floating Quick Action when Zoomed */}
        {zoomedState && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToAllIndia}
              className="bg-white/95 hover:bg-white text-slate-800 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-primary" />
              <span>← Back to All India (State View)</span>
            </button>
          </div>
        )}

        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-10 !bg-white" />

        {/* Floating Hover Information Box */}
        {hoveredInfo && (
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 p-3 rounded-xl text-xs shadow-md pointer-events-none text-left max-w-xs animate-fadeIn">
            <span className="font-bold text-slate-900 block text-sm">{hoveredInfo.title}</span>
            <span className="text-[11px] text-slate-600 block mt-0.5">{hoveredInfo.subtitle}</span>
            {hoveredInfo.detail && (
              <span className="text-[10px] text-emerald-700 font-medium block mt-1 pt-1 border-t border-slate-100">
                {hoveredInfo.detail}
              </span>
            )}
          </div>
        )}

        {/* State/District Mode Badge at bottom right */}
        <div className="absolute bottom-3 right-3 z-20 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] text-slate-500 font-medium shadow-2xs pointer-events-none flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-slate-400" />
          <span>{zoomedState ? `Viewing ${zoomedState.name} Districts` : "National View (36 States & UTs)"}</span>
        </div>

      </div>

      {/* ──── Bottom Detail Bar ──── */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left">
        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <span>{activeStateInfo.name}</span>
            <span className="text-slate-500 font-normal">
              {activeStateInfo.clinicians} {activeStateInfo.clinicians === 1 ? "clinician" : "clinicians"}
            </span>
          </div>
          {activeStateInfo.activeCenters && activeStateInfo.activeCenters.length > 0 && (
            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-md">
              Primary Center: {activeStateInfo.activeCenters[0]}
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Survey of India Official Administrative Boundaries &bull; 726 Districts Mapped
        </div>
      </div>

    </div>
  );
};
