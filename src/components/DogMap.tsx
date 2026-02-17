import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dog } from "@/types/dog";
import { Facility } from "@/types/facility";
import { MapPin } from "lucide-react";

// Fix for default marker icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom paw icon
const createPawIcon = (isVaccinated: boolean) => {
  const color = isVaccinated ? "#2d9a6e" : "#d4a72c";
  const bgColor = isVaccinated ? "#dcfce7" : "#fef9c3";
  
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${bgColor};
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${color}">
          <path d="M8.35 3c-.95 0-1.7.75-1.7 1.7 0 .95.75 1.7 1.7 1.7.95 0 1.7-.75 1.7-1.7 0-.95-.75-1.7-1.7-1.7zm7.3 0c-.95 0-1.7.75-1.7 1.7 0 .95.75 1.7 1.7 1.7.95 0 1.7-.75 1.7-1.7 0-.95-.75-1.7-1.7-1.7zm-10.3 5c-.95 0-1.7.75-1.7 1.7 0 .95.75 1.7 1.7 1.7.95 0 1.7-.75 1.7-1.7 0-.95-.75-1.7-1.7-1.7zm13.3 0c-.95 0-1.7.75-1.7 1.7 0 .95.75 1.7 1.7 1.7.95 0 1.7-.75 1.7-1.7 0-.95-.75-1.7-1.7-1.7zm-6.65 2.5c-2.8 0-5.15 2.05-5.15 4.6 0 2.55 2.35 4.6 5.15 4.6s5.15-2.05 5.15-4.6c0-2.55-2.35-4.6-5.15-4.6z"/>
        </svg>
      </div>
    `,
    className: "custom-paw-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Vet icon (red cross)
const createVetIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #fee2e2;
        border: 2px solid #dc2626;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        cursor: pointer;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
      </div>
    `,
    className: "vet-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Friend icon (paw with roof)
const createFriendIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #dbeafe;
        border: 2px solid #2563eb;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        cursor: pointer;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563eb">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 3.5l5 4.5v6.5h-2v-5h-6v5H7V11l5-4.5z"/>
        </svg>
      </div>
    `,
    className: "friend-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Selection marker icon
const createSelectionIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: hsl(var(--primary));
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: "selection-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

interface DogMapProps {
  dogs: Dog[];
  facilities?: Facility[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectable?: boolean;
  focusDogId?: string;
}

const DogMap = ({ 
  dogs, 
  facilities = [],
  center = [30.4867, -9.6480],
  zoom = 11,
  height = "500px",
  onLocationSelect,
  selectable = false,
  focusDogId
}: DogMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const facilityMarkersRef = useRef<L.Marker[]>([]);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Store callback in ref to avoid re-initializing map
  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Guard against React StrictMode double-invocation
    // (StrictMode mounts → unmounts → mounts again in dev)
    let destroyed = false;

    const map = L.map(mapContainerRef.current, {
      // Improve mobile touch performance
      tap: false,
      tapTolerance: 15,
    }).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      // Limit concurrent tile requests on mobile
      maxNativeZoom: 19,
      maxZoom: 19,
    }).addTo(map);

    if (!destroyed) {
      mapRef.current = map;
    }

    // Handle map clicks for location selection
    if (selectable) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition([lat, lng]);
        onLocationSelectRef.current?.(lat, lng);
      });
    }

    // Fix map rendering after container resize (mobile orientation change)
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      destroyed = true;
      resizeObserver.disconnect();
      // Ensure full cleanup so Leaflet doesn't throw on re-mount
      try {
        map.off();
        map.remove();
      } catch (_) {
        // Silently ignore cleanup errors
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selection marker
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove previous selection marker
    if (selectionMarkerRef.current) {
      selectionMarkerRef.current.remove();
      selectionMarkerRef.current = null;
    }

    // Add new selection marker
    if (selectedPosition && selectable) {
      const marker = L.marker(selectedPosition, { icon: createSelectionIcon() })
        .addTo(mapRef.current);
      selectionMarkerRef.current = marker;
    }
  }, [selectedPosition, selectable]);

  // Update dog markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let focusedMarker: L.Marker | null = null;

    // Add new markers
    dogs.forEach((dog) => {
      const marker = L.marker([dog.latitude, dog.longitude], {
        icon: createPawIcon(dog.isVaccinated)
      }).addTo(mapRef.current!);

      const popupContent = `
        <div style="padding: 12px; min-width: 200px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <img
              src="${dog.photo}"
              alt="${dog.name}"
              style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover;"
              onerror="this.src='/placeholder.svg'"
            />
            <div style="flex: 1;">
              <h3 style="font-weight: bold; font-size: 16px; margin: 0;">${dog.name}</h3>
              <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Ohrmarke: ${dog.earTag}</p>
            </div>
          </div>
          
          <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 14px; color: #666;">${dog.location || 'Unbekannter Standort'}</span>
          </div>
          
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; color: ${dog.isVaccinated ? '#2d9a6e' : '#d4a72c'};">
            <span style="font-size: 14px; font-weight: 500;">
              ${dog.isVaccinated ? '✓ Tagged' : '⚠ Noch nicht geimpft'}
            </span>
          </div>
          
          ${dog.additionalInfo ? `<p style="margin-top: 8px; font-size: 14px; color: #666;">${dog.additionalInfo}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);

      // Track the focused dog's marker
      if (focusDogId && dog.id === focusDogId) {
        focusedMarker = marker;
      }
    });

    // Open popup for focused dog after a short delay to ensure map is ready
    if (focusedMarker) {
      setTimeout(() => {
        focusedMarker?.openPopup();
      }, 300);
    }
  }, [dogs, focusDogId]);

  // Update facility markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old facility markers
    facilityMarkersRef.current.forEach(marker => marker.remove());
    facilityMarkersRef.current = [];

    // Add new facility markers
    facilities.forEach((facility) => {
      const icon = facility.type === 'vet' ? createVetIcon() : createFriendIcon();
      const marker = L.marker([facility.latitude, facility.longitude], { icon })
        .addTo(mapRef.current!);

      const typeLabel = facility.type === 'vet' ? '🏥 Tierarzt' : '🏠 Partner';
      const popupContent = `
        <div style="padding: 12px; min-width: 220px;">
          ${facility.photoUrl ? `
            <img
              src="${facility.photoUrl}"
              alt="${facility.name}"
              style="width: 100%; height: 100px; border-radius: 8px; object-fit: cover; margin-bottom: 12px;"
              onerror="this.style.display='none'"
            />
          ` : ''}
          <div>
            <span style="font-size: 12px; color: ${facility.type === 'vet' ? '#dc2626' : '#2563eb'}; font-weight: 600;">${typeLabel}</span>
            <h3 style="font-weight: bold; font-size: 16px; margin: 4px 0 8px 0;">${facility.name}</h3>
          </div>
          
          ${facility.address ? `<p style="font-size: 13px; color: #666; margin: 4px 0;">📍 ${facility.address}</p>` : ''}
          ${facility.phone ? `<p style="font-size: 13px; color: #666; margin: 4px 0;">📞 ${facility.phone}</p>` : ''}
          ${facility.website ? `<p style="font-size: 13px; margin: 4px 0;"><a href="${facility.website}" target="_blank" style="color: #2563eb;">🌐 Website</a></p>` : ''}
          ${facility.description ? `<p style="margin-top: 8px; font-size: 13px; color: #666;">${facility.description}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      facilityMarkersRef.current.push(marker);
    });
  }, [facilities]);

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="rounded-xl overflow-hidden shadow-medium border border-border animate-fade-in z-0"
        style={{ height }}
      />
      
      {selectable && (
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-soft z-[1000]">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Klicke auf die Karte, um den Standort zu wählen
          </p>
        </div>
      )}
    </div>
  );
};

export default DogMap;
