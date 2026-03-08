import { Link } from 'react-router';
import {
  Building2, Search, Upload, Shield, Star, MapPin,
  Home, Users, CheckCircle2, Phone, ArrowRight,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent" style={{ fontWeight: 700 }}>
                Rent Easy
              </span>
              <span className="hidden sm:block text-xs text-gray-400" style={{ lineHeight: 1 }}>
                Hyderabad's #1 Rental Platform
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm"
              style={{ fontWeight: 500 }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md text-sm"
              style={{ fontWeight: 500 }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-orange-200" />
            <span className="text-orange-100 text-sm" style={{ fontWeight: 500 }}>
              Serving all of Hyderabad — Banjara Hills, Hitech City, Jubilee Hills & more
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl text-white mb-6 max-w-3xl"
            style={{ fontWeight: 800, lineHeight: 1.15 }}
          >
            Find Your Perfect Home in Hyderabad
          </h1>
          <p className="text-xl text-orange-100 mb-10 max-w-xl" style={{ lineHeight: 1.7 }}>
            Connect with verified property owners, take 3D virtual tours, and find your dream rental — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-lg"
              style={{ fontWeight: 700 }}
            >
              <Search className="w-5 h-5" />
              Find a Property
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all text-lg backdrop-blur-sm"
              style={{ fontWeight: 600 }}
            >
              <Upload className="w-5 h-5" />
              List Your Property
            </Link>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-14">
            {[
              { label: 'Active Listings', value: '500+' },
              { label: 'Happy Tenants', value: '2,000+' },
              { label: 'Property Owners', value: '350+' },
              { label: 'Hyderabad Areas', value: '40+' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl text-white" style={{ fontWeight: 800 }}>{s.value}</p>
                <p className="text-orange-100 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-orange-600 text-sm px-3 py-1 bg-orange-100 rounded-full" style={{ fontWeight: 600 }}>
              How It Works
            </span>
            <h2 className="text-3xl mt-3 text-gray-900" style={{ fontWeight: 700 }}>
              Simple. Fast. Reliable.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Owners */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>For Property Owners</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Create your owner account in minutes',
                  'Upload property images (min. 3 required)',
                  'Add 3D virtual tour file (optional)',
                  'Upload nearby places & food court images',
                  'Set amenities, price, and location',
                  'Receive tenant inquiries directly',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                style={{ fontWeight: 600 }}
              >
                List Your Property <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* For Tenants */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl text-gray-900" style={{ fontWeight: 700 }}>For Tenants</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Create your tenant account for free',
                  'Browse hundreds of Hyderabad properties',
                  'Filter by area, price, type & more',
                  'View full-screen image gallery',
                  'Explore 3D virtual tours from home',
                  'Contact the owner directly',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                style={{ fontWeight: 600 }}
              >
                Start Browsing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
              Why Choose Rent Easy?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Listings',
                desc: 'All properties are listed by registered owners — no fake listings.',
              },
              {
                icon: Star,
                title: '3D Virtual Tours',
                desc: 'Explore properties with immersive 3D tours before visiting in person.',
              },
              {
                icon: MapPin,
                title: 'Hyderabad Focused',
                desc: 'Properties exclusively in Hyderabad — covering every major locality.',
              },
              {
                icon: CheckCircle2,
                title: 'Full Image Gallery',
                desc: 'High-resolution photos of interiors, nearby areas, and food courts.',
              },
              {
                icon: Phone,
                title: 'Direct Contact',
                desc: 'Connect with property owners directly — no middlemen or brokers.',
              },
              {
                icon: Home,
                title: 'All Property Types',
                desc: 'Apartments, villas, studios, PG, and independent houses for rent.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2" style={{ fontWeight: 700 }}>{title}</h3>
                <p className="text-gray-600 text-sm" style={{ lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-4xl mb-4" style={{ fontWeight: 800 }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl text-orange-100 mb-10">
            Join thousands of property owners and tenants on Rent Easy today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg"
              style={{ fontWeight: 700 }}
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all text-lg"
              style={{ fontWeight: 600 }}
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-white" style={{ fontWeight: 700 }}>Rent Easy</span>
              <span className="text-gray-500 text-sm">— Hyderabad, Telangana</span>
            </div>
            <p className="text-sm">© 2026 Rent Easy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
