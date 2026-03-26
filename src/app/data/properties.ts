export interface NearbyPlace {
  id: string;
  name: string;
  distance: string;
  category: 'metro' | 'mall' | 'park' | 'hospital' | 'school' | 'restaurant' | 'other';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  city: string;
  furnishing: string;
  // Images & Media
  images: string[];
  tourFileName?: string;
  tourUrl?: string;
  tourMimeType?: string;
  nearbyPlacesImages: string[];
  foodCourtImages: string[];
  // Details
  nearbyPlaces: NearbyPlace[];
  amenities: string[];
  // Owner
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  // Availability
  availableFrom: string;
  createdAt: string;
}

// ─── Mock Hyderabad Data ────────────────────────────────────────────────
export const mockProperties: Property[] = [
  {
    id: 'mock-1',
    title: 'Luxury 3BHK Apartment in Banjara Hills',
    description:
      'Stunning 3BHK luxury apartment in the heart of Banjara Hills. Fully furnished with premium interiors, modular kitchen, and spacious balcony offering breathtaking views of Hyderabad skyline. Just minutes from GVK One Mall, Apollo Hospital, and Hyderabad Metro.',
    type: 'Apartment',
    price: 45000,
    bedrooms: 3,
    bathrooms: 3,
    area: 1800,
    location: 'Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    furnishing: 'Fully Furnished',
    images: [
      'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIeWRlcmFiYWQlMjBsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3NzI3OTc4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwbGl2aW5nJTIwcm9vbSUyMEluZGlhfGVufDF8fHx8MTc3Mjc5Nzg0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBjaXR5JTIwdmlldyUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3NzI3OTc4NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRybyUyMHN0YXRpb24lMjBJbmRpYSUyMG1vZGVybnxlbnwxfHx8fDE3NzI3OTc4NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBJbmRpYSUyMGludGVyaW9yfGVufDF8fHx8MTc3Mjc5Nzg1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    foodCourtImages: [
      'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGNvdXJ0JTIwSW5kaWF8ZW58MXx8fHwxNzcyNzk3ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlaces: [
      { id: 'n1', name: 'Banjara Hills Metro Station', distance: '0.3 km', category: 'metro' },
      { id: 'n2', name: 'GVK One Mall', distance: '1.2 km', category: 'mall' },
      { id: 'n3', name: 'Apollo Hospital', distance: '0.8 km', category: 'hospital' },
      { id: 'n4', name: 'KBR National Park', distance: '2.5 km', category: 'park' },
      { id: 'n5', name: 'Eat Street', distance: '1.8 km', category: 'restaurant' },
    ],
    amenities: [
      'High-Speed WiFi', 'Gym & Fitness Center', 'Swimming Pool', 'Covered Parking',
      '24/7 Security', 'CCTV Surveillance', 'Power Backup', 'Lift/Elevator',
      'Modular Kitchen', 'Air Conditioning',
    ],
    ownerId: 'mock-owner-1',
    ownerName: 'Ravi Reddy',
    ownerPhone: '+91 98480 12345',
    ownerEmail: 'ravi.reddy@gmail.com',
    availableFrom: '2026-03-15',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    title: 'Modern 2BHK Flat in Hitech City',
    description:
      'Brand new 2BHK apartment in the IT hub of Hyderabad, Hitech City. Walking distance to Cyber Towers and major tech companies. Semi-furnished with modular kitchen, wardrobe, and AC in all rooms. Easy access to IKEA and Inorbit Mall.',
    type: 'Apartment',
    price: 32000,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    location: 'Hitech City, Madhapur',
    city: 'Hyderabad',
    furnishing: 'Semi-Furnished',
    images: [
      'https://images.unsplash.com/photo-1737305457496-dc7503cdde1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkaW8lMjBhcGFydG1lbnQlMjBtaW5pbWFsaXN0JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcyNzk3ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIeWRlcmFiYWQlMjBsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3NzI3OTc4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwbGl2aW5nJTIwcm9vbSUyMEluZGlhfGVufDF8fHx8MTc3Mjc5Nzg0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRybyUyMHN0YXRpb24lMjBJbmRpYSUyMG1vZGVybnxlbnwxfHx8fDE3NzI3OTc4NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBJbmRpYSUyMGludGVyaW9yfGVufDF8fHx8MTc3Mjc5Nzg1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    foodCourtImages: [
      'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGNvdXJ0JTIwSW5kaWF8ZW58MXx8fHwxNzcyNzk3ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlaces: [
      { id: 'n1', name: 'Hitech City Metro Station', distance: '0.5 km', category: 'metro' },
      { id: 'n2', name: 'Inorbit Mall', distance: '1.0 km', category: 'mall' },
      { id: 'n3', name: 'IKEA Hyderabad', distance: '3.2 km', category: 'mall' },
      { id: 'n4', name: 'Cyber Towers IT Park', distance: '0.8 km', category: 'other' },
    ],
    amenities: [
      'High-Speed WiFi', 'Parking', '24/7 Security', 'CCTV Surveillance',
      'Power Backup', 'Lift/Elevator', 'Air Conditioning', 'Modular Kitchen',
      'Gym & Fitness Center',
    ],
    ownerId: 'mock-owner-2',
    ownerName: 'Lakshmi Narayanan',
    ownerPhone: '+91 99490 56789',
    ownerEmail: 'lakshmi.n@gmail.com',
    availableFrom: '2026-03-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    title: 'Premium 4BHK Villa in Jubilee Hills',
    description:
      'Magnificent 4BHK independent villa in posh Jubilee Hills with a private garden, car porch, and stunning interiors. Ideal for large families seeking a blend of luxury and privacy. Close to Jubilee Hills Check Post and Film Nagar.',
    type: 'Villa',
    price: 85000,
    bedrooms: 4,
    bathrooms: 4,
    area: 3500,
    location: 'Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    furnishing: 'Fully Furnished',
    images: [
      'https://images.unsplash.com/photo-1647147092965-579d93ed773e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIeWRlcmFiYWQlMjB2aWxsYSUyMHJlc2lkZW50aWFsJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzcyNzk3ODQyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBjaXR5JTIwdmlldyUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3NzI3OTc4NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1711869206287-33a83984d6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIeWRlcmFiYWQlMjBsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMG1vZGVybnxlbnwxfHx8fDE3NzI3OTc4NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwbGl2aW5nJTIwcm9vbSUyMEluZGlhfGVufDF8fHx8MTc3Mjc5Nzg0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1661695013579-9cdd5d1ef425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBJbmRpYSUyMGludGVyaW9yfGVufDF8fHx8MTc3Mjc5Nzg1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    foodCourtImages: [
      'https://images.unsplash.com/photo-1722573783453-2976e515fe3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGNvdXJ0JTIwSW5kaWF8ZW58MXx8fHwxNzcyNzk3ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlaces: [
      { id: 'n1', name: 'Jubilee Hills Check Post', distance: '0.4 km', category: 'other' },
      { id: 'n2', name: 'Ohri\'s Restaurant', distance: '1.0 km', category: 'restaurant' },
      { id: 'n3', name: 'Hyderabad Public School', distance: '1.5 km', category: 'school' },
      { id: 'n4', name: 'KIMS Hospital', distance: '2.2 km', category: 'hospital' },
    ],
    amenities: [
      'Private Garden', 'Car Porch', 'Swimming Pool', 'High-Speed WiFi',
      '24/7 Security', 'Power Backup', 'Air Conditioning', 'Modular Kitchen',
      'Home Theater', 'Servant Quarters', 'Terrace', 'CCTV Surveillance',
    ],
    ownerId: 'mock-owner-3',
    ownerName: 'Suresh Babu',
    ownerPhone: '+91 97000 34567',
    ownerEmail: 'suresh.babu@gmail.com',
    availableFrom: '2026-04-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    title: 'Affordable 1BHK Studio in Kondapur',
    description:
      'Well-maintained 1BHK studio apartment in Kondapur, ideal for working professionals. Unfurnished but has all basic fixtures. Very close to Gachibowli IT corridor. Good connectivity with TSRTC buses and shared autos.',
    type: 'Studio',
    price: 16000,
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    location: 'Kondapur, Near Raheja IT Park',
    city: 'Hyderabad',
    furnishing: 'Unfurnished',
    images: [
      'https://images.unsplash.com/photo-1737305457496-dc7503cdde1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkaW8lMjBhcGFydG1lbnQlMjBtaW5pbWFsaXN0JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcyNzk3ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771327811795-6197403af846?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwbGl2aW5nJTIwcm9vbSUyMEluZGlhfGVufDF8fHx8MTc3Mjc5Nzg0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1762732793012-8bdab3af00b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZW50aG91c2UlMjBjaXR5JTIwdmlldyUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3NzI3OTc4NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    nearbyPlacesImages: [
      'https://images.unsplash.com/photo-1766486232326-ea3937a1a9c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRybyUyMHN0YXRpb24lMjBJbmRpYSUyMG1vZGVybnxlbnwxfHx8fDE3NzI3OTc4NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    foodCourtImages: [],
    nearbyPlaces: [
      { id: 'n1', name: 'Kondapur Metro Station', distance: '0.7 km', category: 'metro' },
      { id: 'n2', name: 'Raheja IT Park', distance: '0.3 km', category: 'other' },
      { id: 'n3', name: 'Kondapur Market', distance: '0.5 km', category: 'other' },
    ],
    amenities: [
      'High-Speed WiFi', 'Parking', '24/7 Water Supply', 'Security Guard',
      'Power Backup', 'Lift/Elevator',
    ],
    ownerId: 'mock-owner-4',
    ownerName: 'Anitha Rao',
    ownerPhone: '+91 91000 78901',
    ownerEmail: 'anitha.rao@gmail.com',
    availableFrom: '2026-03-10',
    createdAt: new Date().toISOString(),
  },
];

// ─── Storage Helpers ────────────────────────────────────────────────────

export const getStoredProperties = (): Property[] => {
  const stored = localStorage.getItem('rentEasy_properties');
  if (stored) {
    const parsed: Property[] = JSON.parse(stored);
    // Merge mock + stored without duplicates
    const storedIds = new Set(parsed.map((p) => p.id));
    const extras = mockProperties.filter((m) => !storedIds.has(m.id));
    return [...extras, ...parsed];
  }
  return mockProperties;
};

export const saveProperty = (property: Property) => {
  const stored = localStorage.getItem('rentEasy_properties');
  const existing: Property[] = stored ? JSON.parse(stored) : [];
  existing.push(property);
  localStorage.setItem('rentEasy_properties', JSON.stringify(existing));
};

export const deleteProperty = (propertyId: string) => {
  const stored = localStorage.getItem('rentEasy_properties');
  if (!stored) return;
  const existing: Property[] = JSON.parse(stored);
  const updated = existing.filter((p) => p.id !== propertyId);
  localStorage.setItem('rentEasy_properties', JSON.stringify(updated));
};

// Backward compat shims
export const getCurrentUser = () => {
  const s = localStorage.getItem('rentEasy_session');
  return s ? JSON.parse(s) : null;
};
export const setCurrentUser = (user: { email: string; role: string; name: string } | null) => {
  if (user) {
    localStorage.setItem('rentEasy_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('rentEasy_session');
  }
};
