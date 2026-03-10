export enum WindowType {
  SINGLE_HUNG = 'SINGLE_HUNG',
  DOUBLE_HUNG = 'DOUBLE_HUNG',
  CASEMENT = 'CASEMENT',
  AWNING = 'AWNING',
  SLIDING = 'SLIDING',
  FIXED = 'FIXED',
  BAY = 'BAY',
  BOW = 'BOW',
  BIFOLD = 'BIFOLD',
  STACKER = 'STACKER',
  LOUVRE = 'LOUVRE',
  SKYLIGHT = 'SKYLIGHT',
  FRENCH_DOOR = 'FRENCH_DOOR',
  SLIDING_DOOR = 'SLIDING_DOOR',
  BIFOLD_DOOR = 'BIFOLD_DOOR',
}

export enum FurnishingType {
  ROLLER_BLIND = 'ROLLER_BLIND',
  ROMAN_BLIND = 'ROMAN_BLIND',
  VENETIAN_BLIND = 'VENETIAN_BLIND',
  VERTICAL_BLIND = 'VERTICAL_BLIND',
  PANEL_GLIDE = 'PANEL_GLIDE',
  PLANTATION_SHUTTER = 'PLANTATION_SHUTTER',
  TIMBER_SHUTTER = 'TIMBER_SHUTTER',
  CURTAIN_EYELET = 'CURTAIN_EYELET',
  CURTAIN_PENCIL_PLEAT = 'CURTAIN_PENCIL_PLEAT',
  CURTAIN_S_FOLD = 'CURTAIN_S_FOLD',
  SHEER_CURTAIN = 'SHEER_CURTAIN',
  DUAL_ROLLER = 'DUAL_ROLLER',
  HONEYCOMB_BLIND = 'HONEYCOMB_BLIND',
  EXTERNAL_BLIND = 'EXTERNAL_BLIND',
  EXTERNAL_AWNING = 'EXTERNAL_AWNING',
  OUTDOOR_ROLLER = 'OUTDOOR_ROLLER',
}

export interface Measurements {
  windowWidth: number | null;
  windowHeight: number | null;
  ceilingToFloor: number | null;
  ceilingToTopOfArchitrave: number | null;
  bottomOfArchitraveToFloor: number | null;
  architraveWidth: number | null;
  architraveProjection: number | null;
  recessDepth: number | null;
  stackingClearanceLeft: number | null;
  stackingClearanceRight: number | null;
  dropToCleats: number | null;
  controlSide: 'left' | 'right' | 'centre' | null;
  openingDirection: 'left' | 'right' | 'both' | null;
  notes: string;
}

export interface PhotoData {
  dataUrl: string;
  fileName: string;
  capturedAt: Date;
}

export interface WindowMeasurement {
  id: string;
  tag: string;
  windowType: WindowType;
  furnishingType: FurnishingType;
  location: 'inside' | 'outside' | 'exact';
  measurements: Measurements;
  photo: PhotoData | null;
  processedImageUrl: string | null;
  specialNotes: string;
  createdAt: Date;
  furnishingSpecs?: Record<string, unknown>;
}

export interface Room {
  id: string;
  name: string;
  windows: WindowMeasurement[];
}

export interface ClientDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

export interface ConsultantDetails {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface AddressDetails {
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  postcode: string;
  country: string;
}

export interface Project {
  id: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'archived';
  client: ClientDetails;
  consultant: ConsultantDetails;
  address: AddressDetails;
  rooms: Room[];
  specialNotes: string;
  get totalWindows(): number;
}
