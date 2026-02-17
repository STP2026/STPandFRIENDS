import { Dog } from "@/types/dog";
import { CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { useState } from "react";

interface SimpleMapProps {
  dogs: Dog[];
  height?: string;
}

const SimpleMap = ({ dogs, height = "500px" }: SimpleMapProps) => {
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  // Map bounds for Agadir-Taghazout area
  const bounds = {
    minLat: 30.35,
    maxLat: 30.60,
    minLng: -9.75,
    maxLng: -9.50,
  };

  // Convert lat/lng to percentage position on the map
  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: Math.min(Math.max(x, 5), 95), y: Math.min(Math.max(y, 5), 95) };
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-medium border border-border animate-fade-in bg-gradient-to-br from-blue-100 to-green-100"
      style={{ height }}
    >
      {/* Map background - using OpenStreetMap static image */}
      <img
        src="https://tile.openstreetmap.org/10/509/369.png"
        alt="Map background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      
      {/* Gradient overlay for better marker visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />

      {/* Dog markers */}
      {dogs.map((dog) => {
        const pos = getPosition(dog.latitude, dog.longitude);
        return (
          <button
            key={dog.id}
            onClick={() => setSelectedDog(selectedDog?.id === dog.id ? null : dog)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-transform hover:scale-110"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 ${
                dog.isVaccinated
                  ? "bg-green-100 border-safe"
                  : "bg-yellow-100 border-warning"
              }`}
            >
              <span className="text-lg">🐾</span>
            </div>
          </button>
        );
      })}

      {/* Selected dog popup */}
      {selectedDog && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card rounded-xl shadow-xl border border-border p-4 z-20 animate-fade-in">
          <button
            onClick={() => setSelectedDog(null)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
          <div className="flex items-start gap-3">
            <img
              src={selectedDog.photo}
              alt={selectedDog.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{selectedDog.name}</h3>
              <p className="text-xs text-muted-foreground">Tag: {selectedDog.earTag}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">{selectedDog.location}</span>
          </div>

          <div
            className={`mt-2 flex items-center gap-2 ${
              selectedDog.isVaccinated ? "text-safe" : "text-warning"
            }`}
          >
            {selectedDog.isVaccinated ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Vaccinated - Safe to pet!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Not yet vaccinated</span>
              </>
            )}
          </div>

          {selectedDog.additionalInfo && (
            <p className="mt-2 text-sm text-muted-foreground">{selectedDog.additionalInfo}</p>
          )}
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground/70 bg-background/50 px-2 py-1 rounded">
        © OpenStreetMap
      </div>
    </div>
  );
};

export default SimpleMap;
