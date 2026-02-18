import { useState } from "react";
import Header from "@/components/Header";
import DogCard from "@/components/DogCard";
import { useDogs } from "@/hooks/useDogs";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const DogsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "vaccinated" | "pending">("all");
  const { user, isAdmin } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const isElevated = isAdmin || !!isHelper;

  // Helpers/admins see all dogs; users see only approved
  const { data: allDogs = [], isLoading } = useDogs(!isElevated);

  // Users only see tagged (save) dogs; helpers/admins see every report type
  const dogs = isElevated ? allDogs : allDogs.filter((d) => d.reportType === 'save');

  const filteredDogs = dogs.filter((dog) => {
    const matchesSearch = dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dog.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      dog.earTag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" ||
      (filter === "vaccinated" && dog.isVaccinated) ||
      (filter === "pending" && !dog.isVaccinated);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Alle Hunde
            </h1>
            <p className="text-muted-foreground">
              Alle registrierten Hunde in unserer Community-Datenbank
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name, Ort oder Ohrmarke..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="gap-1"
              >
                <Filter className="w-4 h-4" />
                Alle
              </Button>
              <Button
                variant={filter === "vaccinated" ? "safe" : "outline"}
                size="sm"
                onClick={() => setFilter("vaccinated")}
                className="gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Geimpft
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                className={filter === "pending" ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
              >
                <AlertCircle className="w-4 h-4" />
                Ausstehend
              </Button>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredDogs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDogs.map((dog, index) => (
                <DogCard key={dog.id} dog={dog} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-muted-foreground text-lg">Keine Hunde gefunden</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
              >
                Filter zurücksetzen
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DogsPage;
