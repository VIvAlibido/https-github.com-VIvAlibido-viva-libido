import {
  Heart,
  Sparkles,
  Shield,
  Leaf,
  ArrowRight,
  Star,
  Menu,
  X,
} from 'lucide-react';

/* ─── Navbar ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-lg dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Viva</span>{' '}
          <span className="text-gray-900 dark:text-white">Libido</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-gray-600 transition hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Voordelen
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-gray-600 transition hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Over Ons
          </a>
          <a
            href="#testimonials"
            className="text-sm font-medium text-gray-600 transition hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Ervaringen
          </a>
          <a
            href="#cta"
            className="rounded-full bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40 hover:brightness-110"
          >
            Start Nu
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-soft absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-400/20 blur-3xl" />
        <div className="animate-pulse-soft animation-delay-200 absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/20 blur-3xl" />
        <div className="animate-pulse-soft animation-delay-400 absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
          <Sparkles className="h-4 w-4" />
          Ontdek jouw vitaliteit
        </div>

        <h1 className="animate-fade-in-up animation-delay-200 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Omarm je{' '}
          <span className="gradient-text">energie</span>
          <br />
          en levenslust
        </h1>

        <p className="animate-fade-in-up animation-delay-400 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
          Viva Libido helpt je om je energie, zelfvertrouwen en vitaliteit te
          herontdekken. Persoonlijke wellness-oplossingen voor een krachtiger
          leven.
        </p>

        <div className="animate-fade-in-up animation-delay-600 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#cta"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-purple-600 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-brand-500/30 transition-all hover:shadow-brand-500/50 hover:brightness-110"
          >
            Begin Vandaag
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-600 dark:hover:text-brand-400"
          >
            Meer Informatie
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const features = [
  {
    icon: Heart,
    title: 'Persoonlijke Aanpak',
    description:
      'Elk lichaam is uniek. Onze oplossingen worden afgestemd op jouw persoonlijke behoeften en doelen.',
  },
  {
    icon: Leaf,
    title: 'Natuurlijke Ingrediënten',
    description:
      'Wij geloven in de kracht van de natuur. Alleen de zuiverste, wetenschappelijk bewezen ingrediënten.',
  },
  {
    icon: Shield,
    title: 'Veilig & Betrouwbaar',
    description:
      'Alle producten zijn klinisch getest en voldoen aan de hoogste kwaliteitsnormen.',
  },
  {
    icon: Sparkles,
    title: 'Zichtbare Resultaten',
    description:
      'Ervaar meer energie, betere focus en een verhoogd gevoel van welzijn binnen enkele weken.',
  },
];

function Features() {
  return (
    <section id="features" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Waarom{' '}
            <span className="gradient-text">Viva Libido</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Wij combineren wetenschap en natuur voor optimale resultaten.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card group rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 p-3 text-white shadow-lg shadow-brand-500/25">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ─── */
function About() {
  return (
    <section id="about" className="relative px-6 py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-soft absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        {/* Visual element */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="h-80 w-80 rounded-3xl bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 shadow-2xl shadow-brand-500/30 lg:h-96 lg:w-96" />
            <div className="animate-float absolute -bottom-6 -right-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">10k+</p>
                  <p className="text-sm text-gray-500">Tevreden klanten</p>
                </div>
              </div>
            </div>
            <div className="animate-float animation-delay-400 absolute -left-6 -top-6 rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-900">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                4.9 gemiddelde score
              </p>
            </div>
          </div>
        </div>

        {/* Text content */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Jouw welzijn is onze{' '}
            <span className="gradient-text">missie</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Bij Viva Libido geloven we dat iedereen het verdient om zich
            energiek, zelfverzekerd en vol levenslust te voelen. Ons team van
            experts heeft jarenlang onderzoek gedaan naar de beste natuurlijke
            oplossingen.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            We combineren traditionele wijsheid met moderne wetenschap om
            producten te creëren die echt werken. Geen loze beloftes, maar
            meetbare resultaten.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-bold gradient-text">98%</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Klanttevredenheid
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">100%</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Natuurlijk & veilig
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: 'Sophie V.',
    text: 'Na een paar weken voelde ik al een enorm verschil. Meer energie, betere focus en ik voel me weer helemaal mezelf!',
    rating: 5,
  },
  {
    name: 'Mark D.',
    text: 'Eindelijk een product dat doet wat het belooft. De persoonlijke aanpak maakt echt het verschil.',
    rating: 5,
  },
  {
    name: 'Lisa T.',
    text: 'Ik was sceptisch, maar de resultaten spreken voor zich. Ik raad Viva Libido aan iedereen aan.',
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Wat onze{' '}
            <span className="gradient-text">klanten</span> zeggen
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-card rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section id="cta" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-pink-500 p-12 text-center shadow-2xl shadow-brand-500/30 lg:p-20">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Klaar om je leven te veranderen?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              Doe mee met duizenden anderen die hun vitaliteit hebben
              herontdekt. Begin vandaag nog met jouw persoonlijke
              wellness-reis.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-brand-700 shadow-xl transition-all hover:bg-gray-50 hover:shadow-2xl"
              >
                Start Gratis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
              >
                Neem Contact Op
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-gray-200 px-6 py-12 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Viva</span>{' '}
            <span className="text-gray-900 dark:text-white">Libido</span>
          </a>
          <p className="mt-2 text-sm text-gray-500">
            Embrace your vitality.
          </p>
        </div>
        <div className="flex gap-8">
          <a
            href="#"
            className="text-sm text-gray-500 transition hover:text-brand-600 dark:hover:text-brand-400"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 transition hover:text-brand-600 dark:hover:text-brand-400"
          >
            Voorwaarden
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 transition hover:text-brand-600 dark:hover:text-brand-400"
          >
            Contact
          </a>
        </div>
        <p className="text-sm text-gray-400">
          &copy; 2026 Viva Libido. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
