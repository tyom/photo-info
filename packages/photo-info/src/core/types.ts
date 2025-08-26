import type * as ExifReader from 'exifreader';
import type { Position, GPSAccuracy, GPSSpeed } from '../gps/types.ts';
import type { ExifCategory } from '../mappings/types.ts';

export type ExifTagName = keyof ExifReader.Tags;
export type ExifTag = ExifReader.Tags[ExifTagName];

export type PhotoInfo = {
  make: string | null;
  model: string | null;
  angleOfView: number | null;
  angleOfViewForMap: number | null; // Effective FOV for map display (considers orientation)
  focalLength: number | null;
  focalLengthIn35mm: number | null;
  gpsPosition: Position | null;
  gpsAccuracy: GPSAccuracy | null;
  gpsSpeed: GPSSpeed | null;
  bearing: number | null;
  width: number;
  height: number;
  orientation: 'landscape' | 'portrait' | 'square';
  frontCamera: boolean;
  dateTime: string | null;
  exposureTime: string | null;
  exposureProgram: string | null;
  fNumber: string | null;
  lens: string | null;
  originalTags?: ExifReader.Tags;
};

export type MappedExifData = {
  [key: string]: {
    value: unknown;
    displayName: string;
    formattedValue: string;
  };
};

export type GroupedExifData = Record<ExifCategory, Record<string, unknown>>;
