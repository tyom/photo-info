/**
 * Mapping configuration for EXIF properties
 * Maps raw EXIF tag names to user-friendly display names and categories
 */

import type { ExifCategory, ExifPropertyMapping } from './types.ts';

/**
 * Comprehensive mapping of EXIF tag names to user-friendly properties
 */
export const exifPropertyMappings: Record<string, ExifPropertyMapping> = {
  // Camera Information
  Make: {
    displayName: 'Camera Make',
    category: 'camera',
  },
  Model: {
    displayName: 'Camera Model',
    category: 'camera',
  },
  Software: {
    displayName: 'Software',
    category: 'camera',
  },

  // Lens Information
  LensModel: {
    displayName: 'Lens Model',
    category: 'lens',
  },
  LensMake: {
    displayName: 'Lens Make',
    category: 'lens',
  },
  LensSpecification: {
    displayName: 'Lens Specification',
    category: 'lens',
  },
  FocalLength: {
    displayName: 'Focal Length',
    category: 'lens',
    unit: 'mm',
  },
  FocalLengthIn35mmFilm: {
    displayName: '35mm Equivalent',
    category: 'lens',
    unit: 'mm',
  },
  MaxApertureValue: {
    displayName: 'Maximum Aperture',
    category: 'lens',
    format: (value) => {
      const strValue = String(value);
      // Avoid double-formatting if already formatted
      return strValue.startsWith('f/') ? strValue : `f/${value}`;
    },
  },

  // Exposure Settings
  FNumber: {
    displayName: 'Aperture',
    category: 'exposure',
    format: (value) => {
      const strValue = String(value);
      // Avoid double-formatting if already formatted
      return strValue.startsWith('f/') ? strValue : `f/${value}`;
    },
  },
  ExposureTime: {
    displayName: 'Shutter Speed',
    category: 'exposure',
  },
  ISOSpeedRatings: {
    displayName: 'ISO',
    category: 'exposure',
  },
  ExposureBiasValue: {
    displayName: 'Exposure Compensation',
    category: 'exposure',
    unit: 'EV',
  },
  ExposureProgram: {
    displayName: 'Exposure Program',
    category: 'exposure',
  },
  MeteringMode: {
    displayName: 'Metering Mode',
    category: 'exposure',
  },
  Flash: {
    displayName: 'Flash',
    category: 'exposure',
  },
  WhiteBalance: {
    displayName: 'White Balance',
    category: 'exposure',
  },

  // Image Information
  'Image Width': {
    displayName: 'Width',
    category: 'image',
    unit: 'px',
  },
  'Image Height': {
    displayName: 'Height',
    category: 'image',
    unit: 'px',
  },
  Orientation: {
    displayName: 'Orientation',
    category: 'image',
  },
  XResolution: {
    displayName: 'Horizontal Resolution',
    category: 'image',
    unit: 'dpi',
  },
  YResolution: {
    displayName: 'Vertical Resolution',
    category: 'image',
    unit: 'dpi',
  },
  ResolutionUnit: {
    displayName: 'Resolution Unit',
    category: 'image',
  },
  ColorSpace: {
    displayName: 'Color Space',
    category: 'image',
  },
  BitsPerSample: {
    displayName: 'Bits Per Sample',
    category: 'image',
  },

  // GPS Information
  GPSLatitude: {
    displayName: 'Latitude',
    category: 'gps',
    unit: '°',
  },
  GPSLongitude: {
    displayName: 'Longitude',
    category: 'gps',
    unit: '°',
  },
  GPSAltitude: {
    displayName: 'Altitude',
    category: 'gps',
    unit: 'm',
  },
  GPSSpeed: {
    displayName: 'Speed',
    category: 'gps',
  },
  GPSImgDirection: {
    displayName: 'Direction',
    category: 'gps',
    unit: '°',
  },
  GPSHPositioningError: {
    displayName: 'GPS Accuracy',
    category: 'gps',
    unit: 'm',
  },

  // Time Information
  DateTime: {
    displayName: 'Date/Time',
    category: 'time',
  },
  DateTimeOriginal: {
    displayName: 'Original Date/Time',
    category: 'time',
  },
  DateTimeDigitized: {
    displayName: 'Digitized Date/Time',
    category: 'time',
  },

  // Advanced/Technical
  ExifVersion: {
    displayName: 'EXIF Version',
    category: 'advanced',
  },
  FieldOfView: {
    displayName: 'Field of View',
    category: 'advanced',
    unit: '°',
  },
  SceneType: {
    displayName: 'Scene Type',
    category: 'advanced',
  },
  SceneCaptureType: {
    displayName: 'Scene Capture Type',
    category: 'advanced',
  },

  // Vendor-specific
  Lens: {
    displayName: 'Lens Info',
    category: 'vendor',
  },
};

/**
 * Get the display name for an EXIF property
 */
export function getDisplayName(tagName: string): string {
  return exifPropertyMappings[tagName]?.displayName || tagName;
}

/**
 * Get the category for an EXIF property
 */
export function getCategory(tagName: string): ExifCategory | undefined {
  return exifPropertyMappings[tagName]?.category;
}
