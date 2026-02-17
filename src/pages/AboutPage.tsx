import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Heart, ExternalLink, Shield, Syringe, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";
import Footer from "@/components/Footer";

const GOFUNDME_LINK = "https://gofund.me/26e9f81e7";
const WEBSITE_LINK  = "https://save-the-paws.de";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">

        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-14 sm:py-20">
          <div className="container mx-auto px-4 max-w-3xl text-center animate-fade-in">
            <img src={logoDark} alt="Save The Paws – Agadir" className="h-16 sm:h-20 w-auto mx-auto mb-6" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
              Ein Rettungsschirm für die{" "}
              <span className="text-primary">Straßenhunde Marokkos</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Save The Paws ist ein zentraler Rettungsschirm für die Straßenhunde Marokkos.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-3xl">

            <div className="glass-card rounded-2xl p-7 sm:p-10 animate-fade-in mb-8 leading-relaxed space-y-4 text-foreground/90">
              <p>
                Wir unterstützen geprüfte Tierschutzorganisationen vor Ort, finanzieren Kastrationen
                und Impfungen, leisten Aufklärungsarbeit – für ein <strong>nachhaltiges, kontrolliertes
                und friedliches Zusammenleben</strong> von Mensch und Tier.
              </p>
              <p>
                Die Bevölkerung soll angstfrei leben können, im Einklang mit gesunden Tieren.
              </p>
              <p className="font-display text-lg text-primary font-semibold">
                Straßenhunde haben ein Recht zu leben.
              </p>
              <p>
                Gesund. Geschützt. Und ohne Leid durch tödliche Krankheiten und unkontrollierte Vermehrung.
              </p>
              <p>
                Damit diese Vision möglich wird, braucht es Menschen, die Verantwortung übernehmen.
                Jede Unterstützung trägt dazu bei, Leben zu retten und langfristig Veränderung zu schaffen.
              </p>
            </div>

            {/* What we do - icon cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10 animate-fade-in">
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Syringe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">Impfungen & Kastrationen</h3>
                <p className="text-xs text-muted-foreground">Finanzierung medizinischer Versorgung vor Ort</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-safe/10 mb-3">
                  <Shield className="w-5 h-5 text-safe" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">Lokaler Tierschutz</h3>
                <p className="text-xs text-muted-foreground">Geprüfte Partnerorganisationen in der Region</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">Aufklärungsarbeit</h3>
                <p className="text-xs text-muted-foreground">Für friedliches Zusammenleben von Mensch & Tier</p>
              </div>
            </div>

            {/* Donation CTA */}
            <div className="glass-card rounded-2xl p-7 sm:p-10 text-center border border-primary/20 bg-primary/5 animate-fade-in mb-8">
              <Heart className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
                Jede Spende rettet Leben
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm sm:text-base">
                Save The Paws ist vollständig auf Spenden angewiesen. Deine Unterstützung
                finanziert Impfungen, Kastrationen und Notfallhilfe direkt vor Ort.
              </p>
              <Button asChild size="lg" className="gap-2">
                <a href={GOFUNDME_LINK} target="_blank" rel="noopener noreferrer">
                  <Heart className="w-5 h-5" />
                  Jetzt spenden
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">💚 Together, we save lives.</p>
            </div>

            {/* App section */}
            <div className="glass-card rounded-2xl p-7 sm:p-10 animate-fade-in mb-8 space-y-4 text-foreground/90 leading-relaxed">
              <h2 className="font-display text-xl font-bold text-foreground">Diese App ist ein Teil unserer Arbeit</h2>
              <p>
                Während wir Dir die „getaggten" Tiere als geimpft, kastriert und <span className="text-safe font-medium">„Sicher"</span> vorstellen
                dürfen, arbeiten wir im Hintergrund an der Erfassung aller Hunde der Region und kümmern
                uns gemeinsam mit dem lokalen Tierschutz um Notfälle.
              </p>
              <p>
                Eine große Aufgabe – doch <strong>gemeinsam können wir heute Leben retten.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild variant="outline" className="gap-2">
                  <a href={WEBSITE_LINK} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                    Zur Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/dogs">
                    <Shield className="w-4 h-4" />
                    Alle Hunde ansehen
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
