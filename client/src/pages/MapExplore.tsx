import { useRef, useState } from "react";
import { MapView } from "@/components/Map";
import { MapPin, Navigation, Building2, GraduationCap, Landmark, Banknote, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const PLACE_TYPES = [
  { id: "tesda", label: "TESDA", icon: GraduationCap, query: "TESDA Technical Education Skills Development", color: "oklch(0.50 0.14 220)" },
  { id: "dole", label: "DOLE", icon: Building2, query: "DOLE Department of Labor Employment", color: "oklch(0.52 0.16 145)" },
  { id: "dswd", label: "DSWD", icon: Landmark, query: "DSWD Department Social Welfare Development", color: "oklch(0.52 0.12 340)" },
  { id: "microfinance", label: "Microfinance", icon: Banknote, query: "microfinance institution cooperative Philippines", color: "oklch(0.52 0.14 60)" },
];

export default function MapExplore() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeType, setActiveType] = useState("tesda");
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: profile } = trpc.profile.get.useQuery();

  const clearMarkers = () => {
    markers.forEach((m) => m.setMap(null));
    setMarkers([]);
  };

  const searchNearby = (map: google.maps.Map, type: string) => {
    const placeType = PLACE_TYPES.find((t) => t.id === type);
    if (!placeType) return;

    setIsSearching(true);
    clearMarkers();

    const center = map.getCenter();
    if (!center) return;

    const service = new google.maps.places.PlacesService(map);
    const request: google.maps.places.TextSearchRequest = {
      query: placeType.query,
      location: center,
      radius: 10000,
    };

    service.textSearch(request, (results, status) => {
      setIsSearching(false);
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const newMarkers: google.maps.Marker[] = [];
        results.slice(0, 10).forEach((place) => {
          if (!place.geometry?.location) return;
          const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: placeType.color,
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: Inter, sans-serif; padding: 4px; max-width: 200px;">
                <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px 0; color: #1a1a2e;">${place.name}</p>
                <p style="font-size: 11px; color: #666; margin: 0;">${place.formatted_address || ""}</p>
                ${place.rating ? `<p style="font-size: 11px; color: #888; margin: 4px 0 0 0;">⭐ ${place.rating}</p>` : ""}
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        });
        setMarkers(newMarkers);
      }
    });
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          map.setCenter(loc);
          map.setZoom(13);

          // User location marker
          new google.maps.Marker({
            map,
            position: loc,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "oklch(0.52 0.16 145)",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 3,
            },
            title: "Iyong Lokasyon / Your Location",
            zIndex: 999,
          });

          searchNearby(map, activeType);
        },
        () => {
          // Default to Manila if no permission
          const manila = { lat: 14.5995, lng: 120.9842 };
          map.setCenter(manila);
          map.setZoom(12);
          searchNearby(map, activeType);
        }
      );
    } else {
      const manila = { lat: 14.5995, lng: 120.9842 };
      map.setCenter(manila);
      map.setZoom(12);
      searchNearby(map, activeType);
    }
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    if (mapRef.current) {
      searchNearby(mapRef.current, type);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ color: "oklch(0.52 0.16 145)" }}>
          Tuklasin / Explore
        </p>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "oklch(0.28 0.04 280)" }}>
          Nearby Resources
        </h1>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PLACE_TYPES.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => handleTypeChange(id)}
              className={cn(
                "flex items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium border transition-all touch-target",
                activeType === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card/60 text-muted-foreground hover:border-primary/40"
              )}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden relative"
        style={{ border: "1px solid oklch(0.9 0.02 280 / 0.6)", minHeight: "300px" }}>
        {isSearching && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2"
            style={{ background: "oklch(0.99 0.005 280 / 0.9)", border: "1px solid oklch(0.9 0.02 280 / 0.6)" }}>
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Naghahanap... / Searching...
          </div>
        )}
        <MapView
          onMapReady={handleMapReady}
          initialCenter={{ lat: 14.5995, lng: 120.9842 }}
          initialZoom={12}
          className="w-full h-full"
        />
      </div>

      {/* Info footer */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 p-3 rounded-xl"
          style={{ background: "oklch(0.97 0.01 165 / 0.6)" }}>
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "oklch(0.52 0.16 145)" }} />
          <p className="text-xs text-muted-foreground">
            {userLocation
              ? "Ipinapakita ang mga lugar malapit sa iyo. / Showing places near you."
              : "Pinayagan ang lokasyon para sa mas tumpak na resulta. / Allow location for better results."}
          </p>
        </div>
      </div>
    </div>
  );
}
