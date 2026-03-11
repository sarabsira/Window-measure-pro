export type CurtainType = 'single' | 'pair';
export type ControlSide = 'left' | 'right';
export type TrackType = 'existing' | 'new-single' | 'new-double';

export interface CurtainMeasurements {
  width: number | null;
  height: number | null;
  stackLeft: number | null;
  stackRight: number | null;
  trackHeightAboveFrame: number | null;
  reductionFromFloor: number | null;
  curtainType: CurtainType | null;
  controlSide: ControlSide | null;
  fabricName: string;
  liningType: string;
  trackType: TrackType | null;
  trackNotes: string;
  windowNotes: string;
}

export interface CurtainWindow {
  id: string;
  tag: string;
  measurements: CurtainMeasurements;
  photos: string[]; // base64 data URLs
  createdAt: Date;
}

export interface ResidentDetails {
  name: string;
  email: string;
  phone: string;
  unitNumber: string;
}

export interface Job {
  id: string;
  village: string;
  resident: ResidentDetails;
  consultantName: string;
  windows: CurtainWindow[];
  createdAt: Date;
  updatedAt: Date;
}
