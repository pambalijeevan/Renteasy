import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Building2, LogOut, Search, MapPin, Bed, Bath, Maximize,
  SlidersHorizontal, X, Home, Box, Image as ImageIcon,
} from 'lucide-react';
import { getCurrentSession, setCurrentSession } from '../data/auth';
import { getStoredProperties, type Property } from '../data/properties';
import { toast } from 'sonner';

const HYDERABAD_AREAS = [
  'All Areas', 'Banjara Hills', 'Jubilee Hills', 'Hitech City', 'Madhapur',
  'Gachibowli', 'Kondapur', 'Kukatpally', 'Begumpet', 'Secunderabad',
  'Ameerpet', 'Somajiguda', 'Panjagutta', 'SR Nagar', 'Miyapur',
  'Manikonda', 'Tolichowki', 'Mehdipatnam', 'Attapur', 'Narsingi',
  'Financial District', 'Uppal', 'LB Nagar', 'Dilsukhnagar',
];

export function TenantDashboard() {
  const navigate = useNavigate();
  const user = getCurrentSession();

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [typeFilter, setTypeFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedroomsFilter, setBedroomsFilter] = useState('Any');
  const [furnishingFilter, setFurnishingFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'tenant') {
      navigate('/login');
      return;
    }
    const props = getStoredProperties();
    setAllProperties(props);
    setFiltered(props);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, areaFilter, typeFilter, maxPrice, bedroomsFilter, furnishingFilter, allProperties]);

  const applyFilters = () => {
    let result = [...allProperties];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q)
      );
    }
    if (areaFilter !== 'All Areas') {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(areaFilter.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      result = result.filter((p) => p.type === typeFilter);
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }
    if (bedroomsFilter !== 'Any') {
      const beds = Number(bedroomsFilter);
      result = result.filter((p) =>
        bedroomsFilter === '4+' ? p.bedrooms >= 4 : p.bedrooms === beds
      );
    }
    if (furnishingFilter !== 'All') {
      result = result.filter((p) => p.furnishing === furnishingFilter);
    }

    setFiltered(result);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAreaFilter('All Areas');
    setTypeFilter('All');
    setMaxPrice('');
    setBedroomsFilter('Any');
    setFurnishingFilter('All');
  };

  const activeFilterCount = [
    areaFilter !== 'All Areas',
    typeFilter !== 'All',
    !!maxPrice,
    bedroomsFilter !== 'Any',
    furnishingFilter !== 'All',
  ].filter(Boolean).length;

  const handleLogout = () => {
    setCurrentSession(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-orange-600" style={{ fontWeight: 700 }}>Rent Easy</span>
            <span className="hidden sm:flex items-center gap-1 ml-1 text-gray-400 text-xs">
              <MapPin className="w-3 h-3" /> Hyderabad
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-700 text-sm" style={{ fontWeight: 700 }}>
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 text-sm">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
            Discover Properties in Hyderabad
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Browse {allProperties.length}+ verified rental listings
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by property name, area, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border transition-all text-sm shadow-sm ${
              showFilters || activeFilterCount > 0
                ? 'bg-orange-600 border-orange-600 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
            }`}
            style={{ fontWeight: 600 }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-white text-orange-600 rounded-full text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 600 }}>Area</label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                >
                  {HYDERABAD_AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 600 }}>Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                >
                  {['All', 'Apartment', 'House', 'Villa', 'Studio', 'PG / Hostel', 'Office Space'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 600 }}>Max Rent (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 30000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 600 }}>Bedrooms</label>
                <select
                  value={bedroomsFilter}
                  onChange={(e) => setBedroomsFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                >
                  {['Any', '1', '2', '3', '4+'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block" style={{ fontWeight: 600 }}>Furnishing</label>
                <select
                  value={furnishingFilter}
                  onChange={(e) => setFurnishingFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                >
                  {['All', 'Fully Furnished', 'Semi-Furnished', 'Unfurnished'].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                style={{ fontWeight: 600 }}
              >
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 text-sm">
            <span style={{ fontWeight: 700 }}>{filtered.length}</span> {filtered.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>

        {/* Properties Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg text-gray-700 mb-2" style={{ fontWeight: 700 }}>No Properties Found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search term</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm"
              style={{ fontWeight: 600 }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <Link key={property.id} to={`/property/${property.id}`}>
                <TenantPropertyCard property={property} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TenantPropertyCard({ property }: { property: Property }) {
  const mainImage = property.images[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-full">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-12 h-12 text-gray-300" />
          </div>
        )}
        {/* Badges */}
        <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-lg" style={{ fontWeight: 600 }}>
          {property.type}
        </span>
        <div className="absolute top-3 right-3 flex gap-1">
          {property.images.length > 1 && (
            <span className="bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ImageIcon className="w-3 h-3" /> {property.images.length}
            </span>
          )}
          {property.tourFileName && (
            <span className="bg-blue-600/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Box className="w-3 h-3" /> 3D
            </span>
          )}
        </div>
        {/* Furnishing badge */}
        {property.furnishing && (
          <span className="absolute bottom-3 left-3 bg-white/90 text-gray-700 text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
            {property.furnishing}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-gray-900 mb-1 line-clamp-1" style={{ fontWeight: 700 }}>
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl text-orange-600" style={{ fontWeight: 800 }}>
            ₹{property.price.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-400 text-sm">/month</span>
        </div>

        <div className="flex gap-3 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms} Bed</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms} Bath</span>
          <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {property.area} sqft</span>
        </div>

        {/* Amenities preview */}
        {property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map((a) => (
              <span key={a} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-lg">
                {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-lg">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
