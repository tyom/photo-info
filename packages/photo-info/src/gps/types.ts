export type Latitude = number;
export type Longitude = number;
export type Altitude = number;
export type Position = [Latitude, Longitude, Altitude?];

export type GPSAccuracyGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type GPSAccuracy = {
  error: number; // Error in meters
  grade: GPSAccuracyGrade;
  description: string;
};

export type GPSSpeed = {
  value: number;
  unit: string;
};
