import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  Building2, MapPin, Bed, Bath, Maximize, Phone, Mail,
  Calendar, ArrowLeft, CheckCircle2, Box, Train, ShoppingBag,
  Activity, GraduationCap, TreePine, Utensils, Star,
  ChevronLeft, ChevronRight, Expand, Copy, MessageCircle,
  Home,
} from 'lucide-react';
import { getCurrentSession, subscribeToSessionUpdates, type SessionUser } from '../data/auth';
import { getStoredProperties, type Property, type NearbyPlace } from '../data/properties';
import { getOrCreateThread, getUnreadCountForUser, sendThreadMessage, subscribeToMessageUpdates } from '../data/messages';
import { getTourAssetBlob } from '../data/tourStorage';
import { ImageGalleryModal } from '../components/ImageGalleryModal';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  metro: <Train className="w-4 h-4" />,
  mall: <ShoppingBag className="w-4 h-4" />,
  hospital: <Activity className="w-4 h-4" />,
  school: <GraduationCap className="w-4 h-4" />,
  park: <TreePine className="w-4 h-4" />,
  restaurant: <Utensils className="w-4 h-4" />,
  other: <Star className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  metro: 'bg-blue-100 text-blue-700',
  mall: 'bg-purple-100 text-purple-700',
  hospital: 'bg-red-100 text-red-700',
  school: 'bg-green-100 text-green-700',
  park: 'bg-emerald-100 text-emerald-700',
  restaurant: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
};

type TourKind = 'model' | 'video' | 'image' | 'file';

const getTourKind = (url: string, fileName: string, mimeType: string): TourKind => {
  const src = (url || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  const isModel =
    mime.startsWith('model/') ||
    mime.includes('gltf') ||
    /\.(glb|gltf)(\?|#|$)/i.test(src) ||
    /\.(glb|gltf)$/i.test(name) ||
    src.startsWith('data:model/') ||
    (src.startsWith('data:application/octet-stream') && /\.(glb|gltf)$/i.test(name));
  if (isModel) return 'model';

  const isVideo =
    mime.startsWith('video/') ||
    /\.(mp4|webm|mov)(\?|#|$)/i.test(src) ||
    /\.(mp4|webm|mov)$/i.test(name) ||
    src.startsWith('data:video/');
  if (isVideo) return 'video';

  const isImage =
    mime.startsWith('image/') ||
    /\.(png|jpg|jpeg|webp|gif)(\?|#|$)/i.test(src) ||
    /\.(png|jpg|jpeg|webp|gif)$/i.test(name) ||
    src.startsWith('data:image/');
  if (isImage) return 'image';

  return 'file';
};

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(() => getCurrentSession());
  const [property, setProperty] = useState<Property | null>(null);
  const [tourViewUrl, setTourViewUrl] = useState<string | null>(null);
  const [tourResolving, setTourResolving] = useState(false);

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Contact state
  const [contactSent, setContactSent] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToSessionUpdates(() => {
      setUser(getCurrentSession());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const props = getStoredProperties();
    const found = props.find((p) => p.id === id);
    if (!found) {
      toast.error('Property not found');
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard');
      return;
    }
    setProperty(found);
    setInquiryMessage(`Hi, I'm interested in renting "${found.title}" listed on Rent Easy. Could you please provide more details? Thank you.`);
  }, [id, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setUnread(getUnreadCountForUser(user));
    const unsubscribe = subscribeToMessageUpdates(() => {
      setUnread(getUnreadCountForUser(user));
    });
    return () => unsubscribe();
  }, [user?.email, user?.role]);

  useEffect(() => {
    let shouldIgnore = false;
    let createdObjectUrl: string | null = null;

    const resolveTour = async () => {
      if (!property) {
        setTourViewUrl(null);
        setTourResolving(false);
        return;
      }

      if (!property.tourAssetId) {
        setTourViewUrl(property.tourUrl || null);
        setTourResolving(false);
        return;
      }

      setTourResolving(true);
      try {
        const blob = await getTourAssetBlob(property.tourAssetId);
        if (shouldIgnore) return;
        if (blob) {
          createdObjectUrl = URL.createObjectURL(blob);
          setTourViewUrl(createdObjectUrl);
        } else {
          setTourViewUrl(property.tourUrl || null);
        }
      } catch {
        if (!shouldIgnore) setTourViewUrl(property.tourUrl || null);
      } finally {
        if (!shouldIgnore) setTourResolving(false);
      }
    };

    resolveTour();

    return () => {
      shouldIgnore = true;
      if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
    };
  }, [property?.id, property?.tourAssetId, property?.tourUrl]);

  const openGallery = (images: string[], index: number, title: string) => {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryTitle(title);
    setGalleryOpen(true);
  };

  const handleContact = () => {
    if (!user || user.role !== 'tenant' || !property) return;
    if (!inquiryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    const thread = getOrCreateThread(property, user);
    sendThreadMessage(thread.threadId, user, inquiryMessage);
    setContactSent(true);
    setShowInquiryForm(false);
    toast.success(
      `Inquiry sent to ${property.ownerName}!`
    );
    navigate('/messages', { state: { threadId: thread.threadId } });
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(property?.ownerPhone || '');
    toast.success('Phone number copied!');
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading property...</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.role === 'owner';
  const backLink = isOwner ? '/owner/dashboard' : '/tenant/dashboard';
  const effectiveTourUrl = tourViewUrl || property.tourUrl || '';
  const hasTour = !!(property.tourFileName || property.tourUrl || property.tourAssetId);
  const tourKind = getTourKind(effectiveTourUrl, property.tourFileName || '', property.tourMimeType || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backLink}>
              <button className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-orange-600" />
              <span className="text-orange-600" style={{ fontWeight: 700 }}>Rent Easy</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="relative text-sm text-orange-600 hover:underline flex items-center gap-1"
              style={{ fontWeight: 600 }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Messages
              {unread > 0 && (
                <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {unread}
                </span>
              )}
            </button>
            <Link
              to={backLink}
              className="text-sm text-orange-600 hover:underline flex items-center gap-1"
              style={{ fontWeight: 600 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-7">
            {/* ── Main Photo Gallery ───────────────────────────────── */}
            <div>
              {/* Main Image */}
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{ aspectRatio: '16/9' }}
                onClick={() => openGallery(property.images, activeImageIdx, property.title)}
              >
                {property.images[activeImageIdx] ? (
                  <img
                    src={property.images[activeImageIdx]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {/* Expand hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 bg-black/60 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-opacity">
                    <Expand className="w-4 h-4" />
                    <span className="text-sm" style={{ fontWeight: 600 }}>View Full Screen</span>
                  </div>
                </div>
                {/* Image counter */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-lg" style={{ fontWeight: 600 }}>
                    {activeImageIdx + 1} / {property.images.length}
                  </div>
                )}
                {/* Badges */}
                <span className="absolute top-4 left-4 bg-orange-600 text-white text-sm px-3 py-1 rounded-xl" style={{ fontWeight: 700 }}>
                  {property.type}
                </span>
                {hasTour && (
                  <span className="absolute top-4 right-14 bg-blue-600 text-white text-sm px-3 py-1 rounded-xl flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                    <Box className="w-3.5 h-3.5" /> 3D Tour Available
                  </span>
                )}
                {/* Prev/Next on main image */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) =>
                          prev === 0 ? property.images.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) =>
                          prev === property.images.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {property.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeImageIdx
                          ? 'border-orange-500 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {/* "View All" button */}
                  <button
                    onClick={() => openGallery(property.images, 0, property.title)}
                    className="flex-shrink-0 w-16 h-12 rounded-lg bg-gray-800 text-white text-xs flex items-center justify-center"
                    style={{ fontWeight: 600 }}
                  >
                    All<br />{property.images.length}
                  </button>
                </div>
              )}
            </div>

            {/* ── Title & Location ─────────────────────────────────── */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>
                  {property.title}
                </h1>
                <span className="flex-shrink-0 bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-xl" style={{ fontWeight: 600 }}>
                  {property.furnishing}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>{property.location}, Hyderabad, Telangana</span>
              </div>
            </div>

            {/* ── Key Stats ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Bed className="w-5 h-5" />, value: property.bedrooms, label: 'Bedrooms' },
                { icon: <Bath className="w-5 h-5" />, value: property.bathrooms, label: 'Bathrooms' },
                { icon: <Maximize className="w-5 h-5" />, value: `${property.area}`, label: 'Sq Ft' },
                {
                  icon: <Calendar className="w-5 h-5" />,
                  value: new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                  label: 'Available From',
                },
              ].map(({ icon, value, label }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                  <div className="flex justify-center text-orange-600 mb-2">{icon}</div>
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>

            {/* ── Description ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>About This Property</h2>
              <p className="text-gray-700" style={{ lineHeight: 1.8 }}>{property.description}</p>
            </div>

            {/* ── Amenities ────────────────────────────────────────── */}
            {property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>Amenities & Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3D Virtual Tour ───────────────────────────────────── */}
            {hasTour && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
                  <Box className="w-5 h-5 text-blue-600" />
                  3D Virtual Tour
                </h2>
                {tourResolving ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-blue-800 text-sm" style={{ fontWeight: 600 }}>
                      Loading 3D tour...
                    </p>
                  </div>
                ) : effectiveTourUrl ? (
                  tourKind === 'model' ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl overflow-hidden border border-blue-200 bg-white shadow-sm">
                        <model-viewer
                          src={effectiveTourUrl}
                          alt={`3D tour of ${property.title}`}
                          camera-controls
                          loading="eager"
                          interaction-prompt="none"
                          touch-action="none"
                          orbit-sensitivity="0.72"
                          interpolation-decay="120"
                          camera-orbit="0deg 75deg 115%"
                          field-of-view="38deg"
                          min-camera-orbit="auto auto 35%"
                          max-camera-orbit="auto auto 240%"
                          min-field-of-view="20deg"
                          max-field-of-view="58deg"
                          style={{ width: '100%', height: '520px', background: '#ffffff', cursor: 'grab' }}
                        />
                      </div>
                      <p className="text-blue-600 text-xs text-center">
                        Drag to rotate, scroll to zoom, and pinch on touch devices.
                      </p>
                    </div>
                  ) : tourKind === 'video' ? (
                    <video
                      src={effectiveTourUrl}
                      controls
                      className="w-full rounded-xl bg-slate-100"
                      style={{ maxHeight: '520px' }}
                    />
                  ) : tourKind === 'image' ? (
                    <button
                      onClick={() => openGallery([effectiveTourUrl], 0, '3D Tour')}
                      className="w-full rounded-xl overflow-hidden border border-blue-100 bg-blue-50"
                    >
                      <img
                        src={effectiveTourUrl}
                        alt={property.tourFileName || '3D Tour'}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '520px' }}
                      />
                    </button>
                  ) : (
                    <a
                      href={effectiveTourUrl}
                      download={property.tourFileName || 'tour-file'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      <Box className="w-4 h-4" />
                      Download {property.tourFileName || '3D tour file'}
                    </a>
                  )
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Box className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-blue-900 mb-2" style={{ fontWeight: 700 }}>3D Tour File Available</p>
                    <p className="text-blue-600 text-sm mb-4">
                      This property has a 3D tour file name, but no preview source is attached.
                    </p>
                    <div className="bg-white rounded-xl px-4 py-3 inline-flex items-center gap-2 border border-blue-200 text-sm text-blue-800">
                      <Box className="w-4 h-4" />
                      <span style={{ fontWeight: 500 }}>{property.tourFileName}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Nearby Places Images ─────────────────────────────── */}
            {property.nearbyPlacesImages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>Nearby Places Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.nearbyPlacesImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openGallery(property.nearbyPlacesImages, idx, 'Nearby Places')}
                    >
                      <img src={img} alt={`Nearby ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => openGallery(property.nearbyPlacesImages, 0, 'Nearby Places Photos')}
                  className="mt-3 text-orange-600 text-sm hover:underline"
                  style={{ fontWeight: 600 }}
                >
                  View all {property.nearbyPlacesImages.length} photos →
                </button>
              </div>
            )}

            {/* ── Food Court Images ────────────────────────────────── */}
            {property.foodCourtImages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
                  <Utensils className="w-5 h-5 text-orange-500" />
                  Nearby Food Courts & Restaurants
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.foodCourtImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group"
                      onClick={() => openGallery(property.foodCourtImages, idx, 'Food Courts & Restaurants')}
                    >
                      <img src={img} alt={`Food ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-2">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black/50 px-2 py-0.5 rounded transition-opacity">
                          View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Nearby Places List ───────────────────────────────── */}
            {property.nearbyPlaces.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-gray-900 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Nearby Places & Distances
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {property.nearbyPlaces.map((place) => (
                    <NearbyPlaceRow key={place.id} place={place} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center mb-5">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl text-orange-600" style={{ fontWeight: 800 }}>
                      ₹{property.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">per month</span>
                  <div className="mt-2 text-sm text-gray-600">
                    Available from{' '}
                    <span style={{ fontWeight: 600 }} className="text-gray-900">
                      {new Date(property.availableFrom).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 mb-5" />

                {/* Owner Info */}
                <div className="mb-5">
                  <p className="text-gray-500 text-xs mb-3 uppercase" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Property Owner</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {property.ownerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900" style={{ fontWeight: 700 }}>{property.ownerName}</p>
                      <p className="text-gray-500 text-xs">Property Owner</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span>{property.ownerPhone}</span>
                      <button
                        onClick={copyPhone}
                        className="ml-auto text-gray-400 hover:text-orange-600 transition-colors"
                        title="Copy phone number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{property.ownerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwner ? (
                  <div className="space-y-3">
                    {!contactSent ? (
                      <>
                        {showInquiryForm ? (
                          <div className="space-y-3">
                            <textarea
                              value={inquiryMessage}
                              onChange={(e) => setInquiryMessage(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowInquiryForm(false)}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleContact}
                                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm hover:from-orange-600 hover:to-orange-700 transition-all"
                                style={{ fontWeight: 700 }}
                              >
                                Send Inquiry
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setShowInquiryForm(true)}
                              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                              style={{ fontWeight: 700 }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Contact Owner
                            </button>
                            <a
                              href={`tel:${property.ownerPhone}`}
                              className="w-full py-3 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-sm"
                              style={{ fontWeight: 600 }}
                            >
                              <Phone className="w-4 h-4" />
                              Call {property.ownerPhone}
                            </a>
                            <button
                              onClick={() => {
                                if (!user || user.role !== 'tenant') return;
                                const thread = getOrCreateThread(property, user);
                                navigate('/messages', { state: { threadId: thread.threadId } });
                              }}
                              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                              style={{ fontWeight: 600 }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Open Messages
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800" style={{ fontWeight: 700 }}>Inquiry Sent!</p>
                        <p className="text-green-700 text-xs mt-1">
                          {property.ownerName} will contact you soon at your registered number.
                        </p>
                        <button
                          onClick={() => { setContactSent(false); setShowInquiryForm(false); }}
                          className="mt-3 text-xs text-green-600 underline"
                        >
                          Send another inquiry
                        </button>
                        <button
                          onClick={() => {
                            if (!user || user.role !== 'tenant') return;
                            const thread = getOrCreateThread(property, user);
                            navigate('/messages', { state: { threadId: thread.threadId } });
                          }}
                          className="mt-2 block w-full text-xs text-orange-600 underline"
                        >
                          Open conversation
                        </button>
                      </div>
                    )}
                  </div>
                ) : property.ownerEmail === user?.email ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <p className="text-orange-800 text-sm" style={{ fontWeight: 700 }}>
                      This is your property listing
                    </p>
                    <button
                      onClick={() => navigate('/owner/dashboard')}
                      className="mt-2 inline-block text-sm text-orange-600 underline"
                    >
                      Manage in Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="mt-1 inline-block text-sm text-orange-600 underline"
                    >
                      Open Messages
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Quick Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <p className="text-gray-500 text-xs mb-3 uppercase" style={{ fontWeight: 600, letterSpacing: '0.05em' }}>Quick Details</p>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Property Type', value: property.type },
                    { label: 'Furnishing', value: property.furnishing },
                    { label: 'Floor Area', value: `${property.area} sq ft` },
                    { label: 'Bedrooms', value: `${property.bedrooms} BHK` },
                    { label: 'Bathrooms', value: `${property.bathrooms}` },
                    { label: 'Location', value: property.location },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-900" style={{ fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full-Screen Gallery Modal */}
      <ImageGalleryModal
        images={galleryImages}
        currentIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onNavigate={setGalleryIndex}
        title={galleryTitle}
      />
    </div>
  );
}

function NearbyPlaceRow({ place }: { place: NearbyPlace }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[place.category] || CATEGORY_COLORS.other}`}>
        {CATEGORY_ICONS[place.category] || CATEGORY_ICONS.other}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm truncate" style={{ fontWeight: 600 }}>{place.name}</p>
        <p className="text-gray-500 text-xs capitalize">{place.category}</p>
      </div>
      <span className="text-orange-600 text-sm flex-shrink-0" style={{ fontWeight: 700 }}>
        {place.distance}
      </span>
    </div>
  );
}
