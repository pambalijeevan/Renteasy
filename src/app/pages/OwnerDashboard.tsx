import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Building2, Plus, LogOut, Home, MapPin, Bed, Bath, Maximize,
  Trash2, Eye, Phone, Calendar, Image as ImageIcon, Box, MessageCircle,
} from 'lucide-react';
import { getCurrentSession, setCurrentSession, subscribeToSessionUpdates, type SessionUser } from '../data/auth';
import { getStoredProperties, deleteProperty, subscribeToPropertyUpdates, type Property } from '../data/properties';
import { getUnreadCountForUser, subscribeToMessageUpdates } from '../data/messages';
import { toast } from 'sonner';

export function OwnerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(() => getCurrentSession());
  const [properties, setProperties] = useState<Property[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToSessionUpdates(() => {
      setUser(getCurrentSession());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
      return;
    }
    const refreshProperties = () => loadProperties();
    refreshProperties();
    const unsubscribeProperties = subscribeToPropertyUpdates(refreshProperties);
    setUnread(getUnreadCountForUser(user));
    const unsubscribe = subscribeToMessageUpdates(() => {
      setUnread(getUnreadCountForUser(user));
    });
    return () => {
      unsubscribe();
      unsubscribeProperties();
    };
  }, [navigate, user?.email, user?.role]);

  const loadProperties = () => {
    const all = getStoredProperties();
    const mine = all.filter((p) => p.ownerEmail === user?.email);
    setProperties(mine);
  };

  const handleLogout = () => {
    setCurrentSession(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    deleteProperty(id);
    loadProperties();
    setDeleteConfirm(null);
    toast.success('Property deleted');
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
              onClick={() => navigate('/messages')}
              className="relative flex items-center gap-2 px-3 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {unread}
                </span>
              )}
            </button>
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
        {/* Page Title + Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
              My Properties
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {properties.length} {properties.length === 1 ? 'listing' : 'listings'} in Hyderabad
            </p>
          </div>
          <Link
            to="/owner/add-property"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-md transition-all"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-5 h-5" />
            Add New Property
          </Link>
        </div>

        {/* Empty State */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2" style={{ fontWeight: 700 }}>
              No Properties Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">
              Start listing your first property and connect with thousands of tenants in Hyderabad.
            </p>
            <Link
              to="/owner/add-property"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-md"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" /> Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                deleteConfirm={deleteConfirm}
                onDelete={handleDelete}
                onCancelDelete={() => setDeleteConfirm(null)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PropertyCard({
  property,
  deleteConfirm,
  onDelete,
  onCancelDelete,
}: {
  property: Property;
  deleteConfirm: string | null;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
}) {
  const mainImage = property.images[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
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
        {/* Type badge */}
        <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs px-2 py-1 rounded-lg" style={{ fontWeight: 600 }}>
          {property.type}
        </span>
        {/* Media badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {property.images.length > 1 && (
            <span className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ImageIcon className="w-3 h-3" /> {property.images.length}
            </span>
          )}
          {property.tourFileName && (
            <span className="bg-blue-600/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Box className="w-3 h-3" /> 3D
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-gray-900 mb-1 truncate" style={{ fontWeight: 700 }}>
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{property.location}</span>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl text-orange-600" style={{ fontWeight: 800 }}>
            ₹{property.price.toLocaleString('en-IN')}
          </span>
          <span className="text-gray-500 text-sm">/month</span>
        </div>

        <div className="flex gap-3 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms} Bed</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms} Bath</span>
          <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {property.area} sqft</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 border-t pt-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>Available from {new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="ml-auto flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            {property.ownerPhone}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/property/${property.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors text-sm"
            style={{ fontWeight: 600 }}
          >
            <Eye className="w-4 h-4" /> View
          </Link>
          {deleteConfirm === property.id ? (
            <div className="flex gap-1.5">
              <button
                onClick={() => onDelete(property.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs hover:bg-red-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Confirm
              </button>
              <button
                onClick={onCancelDelete}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onDelete(property.id)}
              className="px-3 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              title="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
