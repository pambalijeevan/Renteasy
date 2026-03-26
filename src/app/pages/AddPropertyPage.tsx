import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Building2, ArrowLeft, Upload, X, Plus, Trash2,
  CheckSquare, Square, Image, Box, MapPin, Utensils,
  AlertCircle, CheckCircle2, Info,
} from 'lucide-react';
import { getCurrentSession } from '../data/auth';
import { saveProperty, type NearbyPlace } from '../data/properties';
import { saveTourAsset } from '../data/tourStorage';
import { compressImage } from '../utils/imageUtils';
import { toast } from 'sonner';

const AMENITIES_LIST = [
  'High-Speed WiFi', 'Covered Parking', 'Visitor Parking', 'Gym & Fitness Center',
  'Swimming Pool', '24/7 Security', 'CCTV Surveillance', 'Power Backup',
  'Lift/Elevator', 'Air Conditioning', 'Modular Kitchen', 'Water Supply 24/7',
  'Gated Community', 'Children\'s Play Area', 'Community Hall', 'Jogging Track',
  'Garden / Terrace', 'Servant Quarters', 'Home Theater', 'Pet Friendly',
  'Intercom', 'Rain Water Harvesting',
];

const HYDERABAD_AREAS = [
  'Banjara Hills', 'Jubilee Hills', 'Hitech City', 'Madhapur', 'Gachibowli',
  'Kondapur', 'Kukatpally', 'Begumpet', 'Secunderabad', 'Ameerpet',
  'Somajiguda', 'Panjagutta', 'SR Nagar', 'Miyapur', 'Manikonda',
  'Tolichowki', 'Mehdipatnam', 'Attapur', 'Narsingi', 'Financial District',
  'Uppal', 'LB Nagar', 'Dilsukhnagar', 'Nizampet', 'Bachupally',
];

const NEARBY_CATEGORIES = [
  { value: 'metro', label: 'Metro Station' },
  { value: 'mall', label: 'Shopping Mall' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'school', label: 'School / College' },
  { value: 'park', label: 'Park / Garden' },
  { value: 'restaurant', label: 'Restaurant / Café' },
  { value: 'other', label: 'Other' },
];

interface UploadBoxProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  images: string[];
  onAdd: (files: FileList) => void;
  onRemove: (idx: number) => void;
  multiple?: boolean;
  accept?: string;
  required?: boolean;
  minCount?: number;
  isFileMode?: boolean;
  fileName?: string;
}

function UploadBox({
  label, subLabel, icon, images, onAdd, onRemove,
  multiple = true, accept = 'image/*', required, minCount,
  isFileMode, fileName,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const meetsMin = !minCount || images.length >= minCount;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-gray-800" style={{ fontWeight: 600 }}>{label}</span>
          {required && <span className="text-red-500 text-xs">*Required (min {minCount})</span>}
          {!required && <span className="text-gray-400 text-xs">(Optional)</span>}
        </div>
        {minCount && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${meetsMin ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`} style={{ fontWeight: 600 }}>
            {images.length}/{minCount} min
          </span>
        )}
      </div>
      {subLabel && <p className="text-gray-500 text-xs mb-3">{subLabel}</p>}

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-orange-400 mb-2 flex justify-center">{icon}</div>
        <p className="text-gray-600 text-sm" style={{ fontWeight: 500 }}>
          Click to select {isFileMode ? 'file' : 'images'} from your computer
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {isFileMode ? accept : 'PNG, JPG, JPEG accepted'}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && onAdd(e.target.files)}
        />
      </div>

      {/* Uploaded File Display */}
      {isFileMode && fileName && (
        <div className="mt-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <Box className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span className="text-blue-800 text-sm flex-1 truncate" style={{ fontWeight: 500 }}>{fileName}</span>
          <button onClick={() => onRemove(0)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Previews */}
      {!isFileMode && images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((src, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 rounded">Main</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AddPropertyPage() {
  const navigate = useNavigate();
  const user = getCurrentSession();

  // ─ Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '');

  // ─ Images & Media
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [tourFileName, setTourFileName] = useState('');
  const [tourMimeType, setTourMimeType] = useState<string | undefined>(undefined);
  const [tourFile, setTourFile] = useState<File | null>(null);
  const [tourPreviewUrl, setTourPreviewUrl] = useState<string | undefined>(undefined);
  const tourPreviewObjectUrlRef = useRef<string | null>(null);
  const [nearbyImages, setNearbyImages] = useState<string[]>([]);
  const [foodImages, setFoodImages] = useState<string[]>([]);

  // ─ Nearby Places
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([
    { id: '1', name: '', distance: '', category: 'metro' },
  ]);

  // ─ Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─ Image Handlers ───────────────────────────────────────────────────
  const handlePropertyImages = useCallback(async (files: FileList) => {
    const compressed = await Promise.all(
      Array.from(files).map((f) => compressImage(f))
    );
    setPropertyImages((prev) => [...prev, ...compressed]);
  }, []);

  const handleTourFile = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const inferredMime =
      ext === 'glb'
        ? 'model/gltf-binary'
        : ext === 'gltf'
          ? 'model/gltf+json'
          : file.type || undefined;

    setTourFile(file);
    setTourFileName(file.name);
    setTourMimeType(inferredMime);

    if (tourPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(tourPreviewObjectUrlRef.current);
      tourPreviewObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    tourPreviewObjectUrlRef.current = objectUrl;
    setTourPreviewUrl(objectUrl);
  };

  useEffect(() => {
    return () => {
      if (tourPreviewObjectUrlRef.current) {
        URL.revokeObjectURL(tourPreviewObjectUrlRef.current);
      }
    };
  }, []);

  const handleNearbyImages = useCallback(async (files: FileList) => {
    const compressed = await Promise.all(
      Array.from(files).map((f) => compressImage(f))
    );
    setNearbyImages((prev) => [...prev, ...compressed]);
  }, []);

  const handleFoodImages = useCallback(async (files: FileList) => {
    const compressed = await Promise.all(
      Array.from(files).map((f) => compressImage(f))
    );
    setFoodImages((prev) => [...prev, ...compressed]);
  }, []);

  // ─ Nearby Places Handlers ───────────────────────────────────────────
  const addNearbyPlace = () => {
    setNearbyPlaces((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', distance: '', category: 'other' },
    ]);
  };

  const updateNearbyPlace = (id: string, field: keyof NearbyPlace, value: string) => {
    setNearbyPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const removeNearbyPlace = (id: string) => {
    setNearbyPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  // ─ Amenities ────────────────────────────────────────────────────────
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      next.has(amenity) ? next.delete(amenity) : next.add(amenity);
      return next;
    });
  };

  // ─ Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Property title is required';
    if (!propertyType) newErrors.type = 'Property type is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!price || Number(price) <= 0) newErrors.price = 'Valid monthly rent is required';
    if (!bedrooms || Number(bedrooms) <= 0) newErrors.bedrooms = 'Number of bedrooms is required';
    if (!bathrooms || Number(bathrooms) <= 0) newErrors.bathrooms = 'Number of bathrooms is required';
    if (!area || Number(area) <= 0) newErrors.area = 'Area in sq ft is required';
    if (!location) newErrors.location = 'Area/locality is required';
    if (!furnishing) newErrors.furnishing = 'Furnishing status is required';
    if (!availableFrom) newErrors.availableFrom = 'Available from date is required';
    if (!ownerPhone.trim()) newErrors.phone = 'Contact phone is required';
    if (propertyImages.length < 3) newErrors.images = 'At least 3 property images are required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors and try again.');
      // Scroll to first error
      const firstError = document.querySelector('[data-error]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      let tourAssetId: string | undefined;
      if (tourFile) {
        const asset = await saveTourAsset(tourFile);
        tourAssetId = asset.id;
      }

      const validNearby = nearbyPlaces.filter(
        (p) => p.name.trim() && p.distance.trim()
      );

      saveProperty({
        id: `prop-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        type: propertyType,
        price: Number(price),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        location: `${location}, Hyderabad`,
        city: 'Hyderabad',
        furnishing,
        images: propertyImages,
        tourFileName: tourFileName || undefined,
        tourMimeType,
        tourAssetId,
        nearbyPlacesImages: nearbyImages,
        foodCourtImages: foodImages,
        nearbyPlaces: validNearby,
        amenities: Array.from(selectedAmenities),
        ownerId: user!.id,
        ownerName: user!.name,
        ownerPhone: ownerPhone.trim(),
        ownerEmail: user!.email,
        availableFrom,
        createdAt: new Date().toISOString(),
      });

      toast.success('Property listed successfully!');
      navigate('/owner/dashboard');
    } catch {
      toast.error('Failed to save property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ children, step }: { children: React.ReactNode; step: number }) => (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-orange-100">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm flex items-center justify-center flex-shrink-0" style={{ fontWeight: 700 }}>
        {step}
      </div>
      <h2 className="text-lg text-gray-900" style={{ fontWeight: 700 }}>{children}</h2>
    </div>
  );

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="mt-1 text-red-500 text-xs flex items-center gap-1" data-error>
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/owner/dashboard">
              <button className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors">
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-orange-600" />
              <span className="text-orange-600" style={{ fontWeight: 700 }}>Rent Easy</span>
            </div>
          </div>
          <h1 className="text-gray-900" style={{ fontWeight: 700 }}>Add New Property</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-800 text-sm" style={{ fontWeight: 600 }}>All properties are restricted to Hyderabad</p>
            <p className="text-orange-700 text-xs mt-0.5">
              Upload high-quality images for better visibility. Minimum 3 property photos are required. Uploaded images are compressed for performance.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Section 1: Basic Information ─────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={1}>Basic Property Information</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Property Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spacious 3BHK Apartment in Banjara Hills"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                />
                <FieldError field="title" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  >
                    <option value="">Select type</option>
                    {['Apartment', 'House', 'Villa', 'Studio', 'PG / Hostel', 'Office Space'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <FieldError field="type" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Furnishing *
                  </label>
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  >
                    <option value="">Select status</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                  <FieldError field="furnishing" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Description *
                </label>
                <textarea
                  placeholder="Describe your property — highlights, condition, surroundings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900 resize-none"
                />
                <FieldError field="description" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Monthly Rent (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  />
                  <FieldError field="price" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    placeholder="2"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    min="0"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  />
                  <FieldError field="bedrooms" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    placeholder="2"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    min="0"
                    max="20"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  />
                  <FieldError field="bathrooms" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Area (sq ft) *
                  </label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  />
                  <FieldError field="area" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Location & Availability ──────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={2}>Location & Availability</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Area / Locality in Hyderabad *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                >
                  <option value="">Select area in Hyderabad</option>
                  {HYDERABAD_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <FieldError field="location" />
              </div>

              <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <p className="text-orange-700 text-sm">
                  City is fixed as <span style={{ fontWeight: 700 }}>Hyderabad, Telangana</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Available From *
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  />
                  <FieldError field="availableFrom" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                    Your Contact Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-900"
                  />
                  <FieldError field="phone" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Property Images ───────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={3}>Property Images</SectionTitle>
            <UploadBox
              label="Property Images"
              subLabel="Upload interior, exterior, bedroom, kitchen, and bathroom photos. First image will be the main display photo."
              icon={<Image className="w-6 h-6 text-orange-400" />}
              images={propertyImages}
              onAdd={handlePropertyImages}
              onRemove={(idx) => setPropertyImages((prev) => prev.filter((_, i) => i !== idx))}
              required
              minCount={3}
            />
            {errors.images && (
              <p className="mt-2 text-red-500 text-xs flex items-center gap-1" data-error>
                <AlertCircle className="w-3 h-3" /> {errors.images}
              </p>
            )}
          </div>

          {/* ── Section 4: 3D Virtual Tour ───────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={4}>3D Virtual Tour</SectionTitle>
            <UploadBox
              label="3D Tour File"
              subLabel="Upload a 3D tour file (.glb, .gltf, .obj, .zip, .mp4). Tenants can view supported files directly on the property page."
              icon={<Box className="w-6 h-6 text-blue-400" />}
              images={[]}
              onAdd={handleTourFile}
              onRemove={() => {
                setTourFileName('');
                setTourMimeType(undefined);
                setTourFile(null);
                setTourPreviewUrl(undefined);
                if (tourPreviewObjectUrlRef.current) {
                  URL.revokeObjectURL(tourPreviewObjectUrlRef.current);
                  tourPreviewObjectUrlRef.current = null;
                }
              }}
              multiple={false}
              accept=".glb,.gltf,.obj,.zip,.mp4,.360"
              isFileMode
              fileName={tourFileName}
            />
            {tourPreviewUrl && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                {(tourMimeType?.startsWith('model/') || tourMimeType?.includes('gltf') || /\.(glb|gltf)$/i.test(tourFileName)) ? (
                  <>
                    <model-viewer
                      src={tourPreviewUrl}
                      alt="3D model preview"
                      camera-controls
                      auto-rotate
                      loading="eager"
                      touch-action="pan-y"
                      style={{ width: '100%', height: '320px', borderRadius: '0.75rem', background: '#f1f5f9' }}
                    />
                    <p className="text-blue-700 text-xs mt-2 text-center">
                      Live 3D preview: drag to rotate and scroll to zoom.
                    </p>
                  </>
                ) : tourMimeType?.startsWith('video/') ? (
                  <video src={tourPreviewUrl} controls className="w-full rounded-lg" style={{ maxHeight: '320px' }} />
                ) : tourMimeType?.startsWith('image/') ? (
                  <img src={tourPreviewUrl} alt="3D upload preview" className="w-full h-auto rounded-lg object-contain" style={{ maxHeight: '320px' }} />
                ) : (
                  <p className="text-blue-700 text-xs text-center">Preview unavailable for this format.</p>
                )}
              </div>
            )}
          </div>

          {/* ── Section 5: Nearby Places Images ─────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={5}>Nearby Places Images</SectionTitle>
            <UploadBox
              label="Nearby Places Photos"
              subLabel="Upload photos of nearby metro station, shopping malls, parks, hospitals, schools, etc."
              icon={<MapPin className="w-6 h-6 text-green-400" />}
              images={nearbyImages}
              onAdd={handleNearbyImages}
              onRemove={(idx) => setNearbyImages((prev) => prev.filter((_, i) => i !== idx))}
            />
          </div>

          {/* ── Section 6: Food Court Images ────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={6}>Food Court & Restaurant Images</SectionTitle>
            <UploadBox
              label="Food Court / Restaurant Photos"
              subLabel="Upload photos of nearby restaurants, food courts, cafes, and eateries."
              icon={<Utensils className="w-6 h-6 text-red-400" />}
              images={foodImages}
              onAdd={handleFoodImages}
              onRemove={(idx) => setFoodImages((prev) => prev.filter((_, i) => i !== idx))}
            />
          </div>

          {/* ── Section 7: Nearby Places List ───────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={7}>Nearby Places & Distances</SectionTitle>
            <p className="text-gray-500 text-sm mb-4">
              Add key nearby places with their distances (e.g., Metro Station — 0.5 km)
            </p>
            <div className="space-y-3">
              {nearbyPlaces.map((place, idx) => (
                <div key={place.id} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-2.5" style={{ fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Place name (e.g., Hitech City Metro)"
                      value={place.name}
                      onChange={(e) => updateNearbyPlace(place.id, 'name', e.target.value)}
                      className="sm:col-span-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Distance (e.g., 0.5 km)"
                      value={place.distance}
                      onChange={(e) => updateNearbyPlace(place.id, 'distance', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    />
                    <select
                      value={place.category}
                      onChange={(e) => updateNearbyPlace(place.id, 'category', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    >
                      {NEARBY_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  {nearbyPlaces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNearbyPlace(place.id)}
                      className="mt-2 text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addNearbyPlace}
              className="mt-4 flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" /> Add Another Place
            </button>
          </div>

          {/* ── Section 8: Amenities ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <SectionTitle step={8}>Amenities & Features</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AMENITIES_LIST.map((amenity) => {
                const checked = selectedAmenities.has(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                      checked
                        ? 'bg-orange-50 border-orange-400 text-orange-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-orange-300'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span style={{ fontWeight: checked ? 600 : 400 }}>{amenity}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-gray-500 text-xs">
              {selectedAmenities.size} amenities selected
            </p>
          </div>

          {/* ── Submit ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            {/* Summary */}
            <div className="mb-5 space-y-2">
              <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Before You Submit</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Property Images', met: propertyImages.length >= 3, info: `${propertyImages.length}/3 min` },
                  { label: 'Basic Info', met: !!(title && propertyType && price), info: 'Title, type, price' },
                  { label: 'Location', met: !!location, info: location || 'Not selected' },
                  { label: 'Contact Phone', met: !!ownerPhone, info: ownerPhone || 'Not provided' },
                ].map(({ label, met, info }) => (
                  <div key={label} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${met ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {met ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <div>
                      <p style={{ fontWeight: 600 }}>{label}</p>
                      <p className="text-xs opacity-70">{info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/owner/dashboard"
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-center"
                style={{ fontWeight: 600 }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                style={{ fontWeight: 700 }}
              >
                {loading ? 'Adding Property...' : '✓ Add Property'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
