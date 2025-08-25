/**
 * Mapping configuration for EXIF properties
 * Maps raw EXIF tag names to user-friendly display names and categories
 */

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
  ExposureMode: {
    displayName: 'Exposure Mode',
    category: 'exposure',
  },
  MeteringMode: {
    displayName: 'Metering Mode',
    category: 'exposure',
  },
  BrightnessValue: {
    displayName: 'Brightness',
    category: 'exposure',
    unit: 'EV',
  },

  // Flash Information
  Flash: {
    displayName: 'Flash',
    category: 'exposure',
  },
  FlashEnergy: {
    displayName: 'Flash Energy',
    category: 'exposure',
  },

  // White Balance & Color
  WhiteBalance: {
    displayName: 'White Balance',
    category: 'advanced',
  },
  ColorSpace: {
    displayName: 'Color Space',
    category: 'advanced',
  },
  LightSource: {
    displayName: 'Light Source',
    category: 'advanced',
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
  PixelXDimension: {
    displayName: 'Pixel Width',
    category: 'image',
    unit: 'px',
  },
  PixelYDimension: {
    displayName: 'Pixel Height',
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

  // GPS Information
  GPSLatitude: {
    displayName: 'Latitude',
    category: 'gps',
  },
  GPSLongitude: {
    displayName: 'Longitude',
    category: 'gps',
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
  GPSSpeedRef: {
    displayName: 'Speed Unit',
    category: 'gps',
  },
  GPSImgDirection: {
    displayName: 'Camera Direction',
    category: 'gps',
    unit: '°',
  },
  GPSDestBearing: {
    displayName: 'Destination Bearing',
    category: 'gps',
    unit: '°',
  },
  GPSTrack: {
    displayName: 'Movement Direction',
    category: 'gps',
    unit: '°',
  },
  GPSDOP: {
    displayName: 'GPS Precision',
    category: 'gps',
  },
  GPSMapDatum: {
    displayName: 'Map Datum',
    category: 'gps',
  },

  // Date/Time Information
  DateTime: {
    displayName: 'Date/Time Modified',
    category: 'time',
  },
  DateTimeOriginal: {
    displayName: 'Date/Time Original',
    category: 'time',
  },
  DateTimeDigitized: {
    displayName: 'Date/Time Digitized',
    category: 'time',
  },
  SubSecTimeOriginal: {
    displayName: 'Subsecond Time',
    category: 'time',
  },
  GPSDateStamp: {
    displayName: 'GPS Date',
    category: 'time',
  },
  GPSTimeStamp: {
    displayName: 'GPS Time',
    category: 'time',
  },

  // Scene Information
  SceneCaptureType: {
    displayName: 'Scene Type',
    category: 'advanced',
  },
  SubjectArea: {
    displayName: 'Focus Area',
    category: 'advanced',
  },
  SubjectDistance: {
    displayName: 'Subject Distance',
    category: 'advanced',
    unit: 'm',
  },
  SubjectDistanceRange: {
    displayName: 'Distance Range',
    category: 'advanced',
  },
  DigitalZoomRatio: {
    displayName: 'Digital Zoom',
    category: 'advanced',
    unit: 'x',
  },

  // Image Processing
  Contrast: {
    displayName: 'Contrast',
    category: 'advanced',
  },
  Saturation: {
    displayName: 'Saturation',
    category: 'advanced',
  },
  Sharpness: {
    displayName: 'Sharpness',
    category: 'advanced',
  },
  GainControl: {
    displayName: 'Gain Control',
    category: 'advanced',
  },
  CustomRendered: {
    displayName: 'Custom Processing',
    category: 'advanced',
  },

  // Camera Advanced
  SensingMethod: {
    displayName: 'Sensor Type',
    category: 'advanced',
  },
  FileSource: {
    displayName: 'File Source',
    category: 'advanced',
  },
  SceneType: {
    displayName: 'Scene Type',
    category: 'advanced',
  },

  // Metadata
  Artist: {
    displayName: 'Artist/Photographer',
    category: 'advanced',
  },
  Copyright: {
    displayName: 'Copyright',
    category: 'advanced',
  },
  ImageDescription: {
    displayName: 'Description',
    category: 'advanced',
  },
  UserComment: {
    displayName: 'User Comment',
    category: 'advanced',
  },

  // Camera/Lens Serial Info
  SerialNumber: {
    displayName: 'Camera Serial Number',
    category: 'camera',
  },
  LensSerialNumber: {
    displayName: 'Lens Serial Number',
    category: 'lens',
  },
  BodySerialNumber: {
    displayName: 'Body Serial Number',
    category: 'camera',
  },
  ImageNumber: {
    displayName: 'Image Number',
    category: 'camera',
  },

  // Versions
  ExifVersion: {
    displayName: 'EXIF Version',
    category: 'advanced',
  },
  FlashpixVersion: {
    displayName: 'Flashpix Version',
    category: 'advanced',
  },
};

/**
 * Get user-friendly name for an EXIF property
 */
export function getDisplayName(exifTagName: string): string {
  return exifPropertyMappings[exifTagName]?.displayName || exifTagName;
}

/**
 * Get category for an EXIF property
 */
export function getCategory(exifTagName: string): ExifCategory | undefined {
  return exifPropertyMappings[exifTagName]?.category;
}

/**
 * Format an EXIF value using its mapping configuration
 */
export function formatExifValue(exifTagName: string, value: unknown): string {
  const mapping = exifPropertyMappings[exifTagName];

  if (!mapping) {
    return String(value);
  }

  // Apply custom formatter if available
  if (mapping.format && value !== null && value !== undefined) {
    return mapping.format(value);
  }

  // Add unit if specified
  if (mapping.unit && value !== null && value !== undefined) {
    return `${value}${mapping.unit}`;
  }

  return String(value);
}

/**
 * Group EXIF properties by category
 */
export function groupByCategory(
  tags: Record<string, unknown>,
): Record<ExifCategory, Record<string, unknown>> {
  const grouped: Record<ExifCategory, Record<string, unknown>> = {
    camera: {},
    lens: {},
    exposure: {},
    image: {},
    gps: {},
    time: {},
    advanced: {},
    vendor: {},
  };

  for (const [tagName, value] of Object.entries(tags)) {
    const category = getCategory(tagName);
    if (category) {
      const displayName = getDisplayName(tagName);
      grouped[category][displayName] = formatExifValue(tagName, value);
    }
  }

  // Remove empty categories
  for (const category of Object.keys(grouped) as ExifCategory[]) {
    if (Object.keys(grouped[category]).length === 0) {
      delete grouped[category];
    }
  }

  return grouped;
}
