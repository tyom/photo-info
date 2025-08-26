export type ExifCategory =
  | 'camera'
  | 'lens'
  | 'exposure'
  | 'image'
  | 'gps'
  | 'time'
  | 'advanced'
  | 'vendor';

export interface ExifPropertyMapping {
  displayName: string;
  category: ExifCategory;
  unit?: string;
  format?: (value: unknown) => string;
}
