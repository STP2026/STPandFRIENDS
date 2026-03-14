import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Phone, Store, Coffee, Hotel, Stethoscope, Star, ArrowRight, ShoppingBag, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFacilities } from "@/hooks/useFacilities";
import merchPreview from "@/assets/merch-preview.jpeg";

const NIKLAS_WHATSAPP = "https://wa.me/4915756175163";
const NIKLAS_PHONE = "tel:+4915756175163";
const GOFUNDME = "https://gofund.me/26e9f81e7";
const HORAYGOODS = "https://horaygoods.de";

const products = [
  {
    emoji: "🧥",
    nameKey: "pawfriends.shop.hoodie.name",
    nameFallback: "Save The Paws Hoodie",
    descKey: "pawfriends.shop.hoodie.desc",
    descFallback: "Hochwertiger Hoodie mit Save The Paws Print — zeig, wofür du stehst.",
    price: "37,50 €",
    donation: "25,00 €",
    donationKey: "pawfriends.shop.hoodie.donation",
  },
  {
    emoji: "👜",
    nameKey: "pawfriends.shop.bag.name",
    nameFallback: "Gassi-Tasche",
    descKey: "pawfriends.shop.bag.desc",
    descFallback: "Flauschige Umhängetasche mit STP-Logo — perfekt für den Strand und die Promenade.",
    price: "24,50 €",
    donation: "20,00 €",
    donationKey: "pawfriends.shop.bag.donation",
  },
  {
    emoji: "📿",
    nameKey: "pawfriends.shop.bracelet.name",
    nameFallback: "Armband",
    descKey: "pawfriends.shop.bracelet.desc",
    descFallback: "Handgemachtes Armband — \"Be a lifesaver.\" Der gesamte Erlös fließt in die Hunderettung.",
    price: "10,00 €",
    donation: "10,00 €",
    donationKey: "pawfriends.shop.bracelet.donation",
  },
];

const PawFriendsPage = () => {
  const { t } = useTranslation();
  const { data: facilities = [] } = useFacilities();
  const pawFriends = facilities.filter(f => f.type === 'friend');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-emerald-50 dark:to-emerald-950/20 py-16 sm:py-24">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              {t('pawfriends.badge', 'Lokale Unterstützer & Shop')}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-5 leading-tight">
              {t('pawfriends.heroTitle', 'PawFriends')}
              <span className="block text-primary mt-1">{t('pawfriends.heroSubtitle', 'Hundefreundliche Orte & Shop für Freunde')}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('pawfriends.heroDesc', 'Restaurants, Cafés, Hotels und Shops die Hunde willkommen heißen — und den lokalen Tierschutz aktiv unterstützen. Erkennbar am PawFriends-Sticker an der Tür.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/map">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <MapPin className="w-5 h-5" />
                  {t('pawfriends.mapCta', 'Alle PawFriends auf der Karte')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#shop">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {t('pawfriends.shopCta', 'Shop for Friends')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── What is PawFriends ── */}
        <section className="py-14 sm:py-20 container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              {t('pawfriends.whatTitle', 'Was ist PawFriends?')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('pawfriends.whatDesc', 'PawFriends verbindet hundefreundliche Unternehmen mit Touristen und Einheimischen, die Hunde lieben — und unterstützt gleichzeitig Save The Paws.')}
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🏷️', title: t('pawfriends.benefit1Title', 'Sticker an der Tür'), desc: t('pawfriends.benefit1Desc', 'Ein offizieller PawFriends-Sticker kennzeichnet dein Lokal als hundefreundlichen Ort — sichtbar für alle Touristen.') },
              { icon: '📍', title: t('pawfriends.benefit2Title', 'Pin auf der Karte'), desc: t('pawfriends.benefit2Desc', 'Dein Eintrag erscheint auf unserer interaktiven Karte — gefunden von Tausenden Touristen und Tierfreunden aus aller Welt.') },
              { icon: '💚', title: t('pawfriends.benefit3Title', 'Gutes tun'), desc: t('pawfriends.benefit3Desc', 'Du unterstützt damit aktiv den Tierschutz in der Region Agadir-Taghazout und hilfst uns, mehr Hunden zu helfen.') },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Shop for Friends ── */}
        <section id="shop" className="py-14 sm:py-20 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <ShoppingBag className="w-4 h-4" />
                {t('pawfriends.shopBadge', 'Shop for Friends')}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {t('pawfriends.shopTitle', 'Trage den Unterschied')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('pawfriends.shopDesc', 'Jeder Kauf ist eine direkte Spende für die Hunde der Region. Merch mit Herz — subventioniert mit freundlicher Unterstützung von horaygoods.de.')}
              </p>
            </div>

            {/* Merch Preview Image */}
            <div className="rounded-2xl overflow-hidden mb-12 shadow-lg max-w-3xl mx-auto">
              <img
                src={merchPreview}
                alt="Save The Paws Merch — Hoodie, Gassi-Tasche, Armband"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Product Cards */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {products.map((p, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden border border-border animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-8 flex items-center justify-center">
                    <span className="text-6xl">{p.emoji}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      {t(p.nameKey, p.nameFallback)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {t(p.descKey, p.descFallback)}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('pawfriends.shop.price', 'Preis')}</span>
                        <span className="text-xl font-bold text-foreground">{p.price}</span>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                        <span className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {t('pawfriends.shop.donationShare', 'davon Spende')}
                        </span>
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">{p.donation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order CTA */}
            <div className="glass-card rounded-2xl p-8 text-center border border-primary/20 max-w-2xl mx-auto">
              <p className="font-bold text-foreground mb-2 text-lg">
                {t('pawfriends.shop.orderTitle', 'Bestellen & spenden')}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {t('pawfriends.shop.orderDesc', 'Schreib uns einfach per WhatsApp mit deiner Bestellung. Wir kümmern uns um den Rest.')}
              </p>
              <a href={NIKLAS_WHATSAPP} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('pawfriends.shop.orderButton', 'Jetzt per WhatsApp bestellen')}
                </Button>
              </a>
              <p className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-1">
                {t('pawfriends.shop.horayNote', 'Merch wird mit freundlicher Unterstützung von')}
                {' '}
                <a href={HORAYGOODS} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground inline-flex items-center gap-0.5">
                  horaygoods.de <ExternalLink className="w-3 h-3" />
                </a>
                {' '}{t('pawfriends.shop.horayNote2', 'subventioniert.')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Who fits ── */}
        <section className="py-12 bg-secondary/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              {t('pawfriends.whoTitle', 'Wer kann PawFriend-Location werden?')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Coffee, label: t('pawfriends.type.cafe', 'Café & Restaurant') },
                { icon: Hotel, label: t('pawfriends.type.hotel', 'Hotel & Riad') },
                { icon: Store, label: t('pawfriends.type.shop', 'Shop & Boutique') },
                { icon: Stethoscope, label: t('pawfriends.type.vet', 'Tierarzt & Tierpflege') },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-5 text-center">
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Existing PawFriends ── */}
        {pawFriends.length > 0 && (
          <section className="py-14 container mx-auto px-4 max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              {t('pawfriends.currentTitle', 'Aktuelle PawFriend-Locations')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pawFriends.map((f) => (
                <div key={f.id} className="glass-card rounded-xl p-5 flex items-start gap-4">
                  {f.photoUrl ? (
                    <img src={f.photoUrl} alt={f.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">{f.name}</p>
                    {f.address && <p className="text-xs text-muted-foreground mt-0.5">{f.address}</p>}
                    {f.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Become PawFriend Location CTA ── */}
        <section className="py-14 container mx-auto px-4 max-w-2xl">
          <div className="glass-card rounded-2xl p-8 sm:p-10 text-center border-2 border-primary/20 animate-fade-in">
            <div className="text-5xl mb-5">📍</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {t('pawfriends.ctaTitle', 'Dein Lokal als PawFriend-Location')}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t('pawfriends.ctaDesc', 'Kein komplizierter Prozess — schreib uns einfach und wir kümmern uns um alles. Unverbindlich und schnell.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={NIKLAS_WHATSAPP} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Niklas
                </Button>
              </a>
              <a href={NIKLAS_PHONE}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Phone className="w-5 h-5" />
                  +49 1575 6175163
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              {t('pawfriends.ctaNote', 'Unverbindlich — wir melden uns innerhalb von 24 Stunden.')}
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default PawFriendsPage;
