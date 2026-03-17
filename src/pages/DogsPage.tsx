import { useState } from "react";
import Header from "@/components/Header";
import DogCard from "@/components/DogCard";
import { useDogs } from "@/hooks/useDogs";
import { useAuth } from "@/contexts/AuthContext";
import { useIsHelper } from "@/hooks/useHelperApplication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, CheckCircle, AlertCircle, Loader2, Shield, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";

const DogsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "vaccinated" | "pending">("all");
  const { user, isAdmin } = useAuth();
  const { data: isHelper } = useIsHelper(user?.id);
  const isElevated = isAdmin || !!isHelper;

  // Auth guards BEFORE hook calls that depend on auth
  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!isElevated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="glass-card rounded-xl p-8 text-center max-w-md">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {t('admin.accessDenied')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t('dogs.helperOnly', 'Diese Seite ist nur für Helfer und Admins zugänglich.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/become-helper">
                <Button className="gap-2 w-full sm:w-auto">
                  <Heart className="w-4 h-4" />
                  {t('dogs.becomeHelper', 'Helfer werden')}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => navigate("/")}>
                {t('admin.goHome')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <DogsContent isElevated={isElevated} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filter={filter} setFilter={setFilter} />;
};

// Separate component so hooks only run after auth is confirmed
const DogsContent = ({
  isElevated, searchTerm, setSearchTerm, filter, setFilter
}: {
  isElevated: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filter: "all" | "vaccinated" | "pending";
  setFilter: (v: "all" | "vaccinated" | "pending") => void;
}) => {
  const { t } = useTranslation();
  const { data: allDogs = [], isLoading } = useDogs(isElevated);

  const filteredDogs = allDogs.filter(dog => {
    const matchesSearch =
      dog.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dog.earTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dog.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "vaccinated" && dog.isVaccinated) ||
      (filter === "pending" && !dog.isApproved);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {t('dogsPage.title', 'Alle Hunde')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {allDogs.length} {t('dogsPage.total', 'Hunde insgesamt')}
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dogsPage.searchPlaceholder', 'Suche nach Name, Ohrmarke, Ort...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'vaccinated', 'pending'] as const).map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="gap-1.5"
                >
                  {f === 'vaccinated' && <CheckCircle className="w-3.5 h-3.5" />}
                  {f === 'pending' && <AlertCircle className="w-3.5 h-3.5" />}
                  {f === 'all' && <Filter className="w-3.5 h-3.5" />}
                  {t(`dogsPage.filter.${f}`, f)}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">{t('dogsPage.noDogs', 'Keine Hunde gefunden.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDogs.map(dog => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DogsPage;
