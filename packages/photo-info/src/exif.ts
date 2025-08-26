import * as ExifReader from 'exifreader';
import {
  calculateAnglesOfView,
  divideByNext,
  reformatDate,
  inferSensorAspectRatio,
} from './utils.ts';
import {
  groupByCategory,
  getDisplayName,
  formatExifValue,
  type ExifCategory,
} from './exif-mappings.ts';

type Latitude = number;
type Longitude = number;
type Altitude = number;
export type Position = [Latitude, Longitude, Altitude?];

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

export type GPSAccuracyGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type GPSAccuracy = {
  error: number; // Error in meters
  grade: GPSAccuracyGrade;
  description: string;
};

type PhotoInfo = {
  make: string | null;
  model: string | null;
  angleOfView: number | null;
  angleOfViewForMap: number | null; // Effective FOV for map display (considers orientation)
  focalLength: number | null;
  focalLengthIn35mm: number | null;
  gpsPosition: Position | null;
  gpsAccuracy: GPSAccuracy | null;
  gpsSpeed: {
    value: number;
    unit: string;
  } | null;
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

const truncateSpeedUnit = (unit: string) => {
  const units: Record<string, string> = {
    'Kilometers per hour': 'km/h',
  };
  return units[unit] ?? unit;
};

/**
 * Calculate GPS accuracy grade based on horizontal positioning error
 * @param error - GPS horizontal positioning error in meters (null means excellent accuracy)
 * @returns GPS accuracy grade and description
 */
function calculateGPSAccuracy(error: number | null): GPSAccuracy | null {
  // No error field typically means excellent GPS accuracy
  if (error === null) {
    return {
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    };
  }

  let grade: GPSAccuracyGrade;
  let description: string;

  if (error < 5) {
    grade = 'A';
    description = 'Excellent - Strong satellite fix';
  } else if (error < 10) {
    grade = 'B';
    description = 'Good - Typical smartphone accuracy';
  } else if (error < 20) {
    grade = 'C';
    description = 'Fair - Some obstructions';
  } else if (error < 50) {
    grade = 'D';
    description = 'Poor - Weak signal or just acquired';
  } else {
    grade = 'F';
    description = 'Very poor - Unreliable GPS data';
  }

  return {
    error: parseFloat(error.toFixed(2)),
    grade,
    description,
  };
}

async function parseExifData(file: File) {
  let tags: ExifReader.Tags;

  try {
    tags = await ExifReader.load(file);
  } catch (error) {
    // If EXIF parsing fails, return minimal data structure
    console.warn(`Failed to parse EXIF data for ${file.name}:`, error);
    tags = {} as ExifReader.Tags;
  }

  function getExifValue<
    K extends keyof ExifTag = keyof ExifTag,
    V = ExifTag[K],
  >(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ): V | null {
    const tag = tags[tagName];

    if (tag === undefined) {
      return null;
    }

    const value = tag[key];

    if (transformer) {
      return transformer(value);
    }

    return value as V;
  }

  /**
   * Get the position of the photo from the EXIF data.
   * @returns The position of the photo as a [latitude, longitude] tuple.
   */
  function getPosition() {
    if ('GPSLatitude' in tags && 'GPSLongitude' in tags) {
      // West longitude is negative
      const lonRef = getExifValue('GPSLongitudeRef', 'value', (v) =>
        v[0] === 'E' ? 1 : -1,
      );
      // South latitude is negative
      const latRef = getExifValue('GPSLatitudeRef', 'value', (v) =>
        v[0] === 'N' ? 1 : -1,
      );
      const longitude = lonRef
        ? getExifValue('GPSLongitude', 'description', (long) => +long * lonRef)
        : null;
      const latitude = latRef
        ? getExifValue('GPSLatitude', 'description', (lat) => +lat * latRef)
        : null;
      const altitude = getExifValue('GPSAltitude', 'value', (value) =>
        divideByNext(value as number[]),
      );

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        return null;
      }

      const result = [
        parseFloat(latitude.toFixed(7)),
        parseFloat(longitude.toFixed(7)),
      ];

      if (altitude) {
        result.push(parseFloat(altitude.toFixed(2)));
      }

      return result as Position;
    }

    return null;
  }

  return {
    tags,
    gpsPosition: getPosition(),
    getExifValue,
  };
}

/**
 * Get the location information from the EXIF data of a photo.
 * @param file - image file with EXIF data
 * @param includeOriginalTags - whether to include the original EXIF data
 * @returns the formatted metadata of the photo
 */
export async function getPhotoInfo(
  file: File,
  includeOriginalTags = false,
): Promise<PhotoInfo> {
  const { tags, gpsPosition, getExifValue } = await parseExifData(file);

  const bearing = getExifValue('GPSImgDirection', 'description', (degrees) =>
    parseFloat((+degrees).toFixed(2)),
  );
  const focalLength = getExifValue('FocalLength', 'value', (value) =>
    divideByNext(value as number[]),
  );
  const focalLengthIn35mm = getExifValue('FocalLengthIn35mmFilm', 'value') as
    | number
    | null;
  const width = getExifValue('Image Width', 'value') as number | null;
  const height = getExifValue('Image Height', 'value') as number | null;

  // Default dimensions if not available from EXIF
  const finalWidth = width ?? 0;
  const finalHeight = height ?? 0;

  const frontCamera = !!getExifValue('Lens', 'value')?.includes(' front ');
  const imageOrientation = getExifValue('Orientation', 'description') ?? '';
  const isPortrait = ['right-top', 'left-top'].includes(imageOrientation);
  const dateTime = getExifValue('DateTime', 'description');

  const fNumber = getExifValue('FNumber', 'value', (value) =>
    divideByNext(value as number[]),
  );

  let gpsSpeed: { value: number; unit: string } | null = null;
  const gpsSpeedValue = getExifValue('GPSSpeed', 'value', (value) =>
    divideByNext(value as number[]),
  );
  const gpsSpeedRef = getExifValue('GPSSpeedRef', 'description');

  if (gpsSpeedValue !== null && gpsSpeedRef !== null) {
    gpsSpeed = {
      value: gpsSpeedValue,
      unit: truncateSpeedUnit(gpsSpeedRef),
    };
  }

  // Get GPS accuracy information
  const gpsHError = getExifValue('GPSHPositioningError', 'value', (value) =>
    divideByNext(value as number[]),
  );
  // Only calculate accuracy if we have GPS position data
  const gpsAccuracy = gpsPosition ? calculateGPSAccuracy(gpsHError) : null;

  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';
  if (finalWidth === finalHeight) {
    orientation = 'square';
  } else if (finalHeight > finalWidth || isPortrait) {
    orientation = 'portrait';
  }

  let adjustedWidth = finalWidth;
  let adjustedHeight = finalHeight;
  // Sometimes the width and the height are not aligned with the orientation
  // Assume that all photos with width > height are portrait
  if (finalWidth > finalHeight && isPortrait) {
    adjustedWidth = finalHeight;
    adjustedHeight = finalWidth;
  }

  // Determine sensor aspect ratio from image dimensions if available
  let aspectRatio: string | undefined;
  if (finalWidth && finalHeight) {
    aspectRatio = inferSensorAspectRatio(finalWidth, finalHeight);
  }

  // Try to get FieldOfView from EXIF first (some cameras/phones provide this)
  // If not available, calculate it
  let angleOfView: number | null = getExifValue('FieldOfView', 'value') as
    | number
    | null;

  // Round the EXIF FieldOfView value if present
  if (angleOfView) {
    angleOfView = parseFloat(angleOfView.toFixed(4));
  }

  let angleOfViewForMap: number | null = null;

  // If FieldOfView is not in EXIF, calculate it
  if (!angleOfView && focalLength) {
    // For iPhones and some cameras, when there's a significant crop factor (> 5),
    // the FOV is often calculated from the 35mm equivalent
    const cropFactor = focalLengthIn35mm ? focalLengthIn35mm / focalLength : 1;

    // For phones with high crop factors, use 35mm equivalent FOV calculation
    // For DSLRs and mirrorless (crop factor < 5), use sensor-based calculation
    if (cropFactor > 5 && focalLengthIn35mm) {
      // Phone sensors: calculate FOV from 35mm equivalent
      angleOfView =
        2 * Math.atan(36 / (2 * focalLengthIn35mm)) * (180 / Math.PI);
      angleOfView = parseFloat(angleOfView.toFixed(4));

      // For phones, also calculate vertical FOV for portrait orientation
      // Using 3:2 aspect ratio for 35mm (36x24mm)
      const verticalFov35mm =
        2 * Math.atan(24 / (2 * focalLengthIn35mm)) * (180 / Math.PI);
      angleOfViewForMap =
        orientation === 'portrait'
          ? parseFloat(verticalFov35mm.toFixed(4))
          : angleOfView;
    } else {
      // DSLR/Mirrorless: use sensor dimension-based calculation
      // Calculate both horizontal and vertical FOV
      const fovs = calculateAnglesOfView(
        focalLength,
        focalLengthIn35mm,
        aspectRatio,
      );
      angleOfView = fovs.horizontal;

      // For portrait orientation, use vertical FOV for the map marker
      angleOfViewForMap =
        orientation === 'portrait' ? fovs.vertical : fovs.horizontal;
    }
  } else if (angleOfView) {
    // If we have angleOfView from EXIF, estimate the vertical FOV for portrait
    // Most cameras report horizontal FOV, so we need to calculate vertical
    if (orientation === 'portrait' && aspectRatio) {
      const [w, h] = aspectRatio.split(':').map(Number);
      const aspectRatioValue = w / h;
      // Approximate vertical FOV from horizontal FOV and aspect ratio
      const horizontalRad = angleOfView * (Math.PI / 180);
      const verticalRad =
        2 * Math.atan(Math.tan(horizontalRad / 2) / aspectRatioValue);
      angleOfViewForMap = parseFloat(
        (verticalRad * (180 / Math.PI)).toFixed(4),
      );
    } else {
      angleOfViewForMap = angleOfView;
    }
  }

  const result: PhotoInfo = {
    make: getExifValue('Make', 'description'),
    model: getExifValue('Model', 'description'),
    angleOfView,
    angleOfViewForMap,
    focalLength: focalLength ? parseFloat(focalLength.toFixed(2)) : null,
    focalLengthIn35mm,
    gpsPosition,
    gpsAccuracy,
    gpsSpeed,
    bearing,
    width: adjustedWidth,
    height: adjustedHeight,
    orientation,
    frontCamera,
    dateTime: reformatDate(dateTime),
    exposureTime: getExifValue('ExposureTime', 'description'),
    exposureProgram: getExifValue('ExposureProgram', 'description'),
    fNumber: fNumber ? `f/${fNumber}` : null,
    lens:
      getExifValue('Lens', 'value') ?? getExifValue('LensModel', 'description'),
  };

  if (includeOriginalTags) {
    result.originalTags = tags;
  }

  return result;
}

/**
 * Get photo information with user-friendly mapped EXIF data
 * @param file - image file with EXIF data
 * @returns mapped EXIF data with display names and formatted values
 */
export async function getMappedPhotoInfo(file: File): Promise<MappedExifData> {
  const { tags } = await parseExifData(file);
  const mapped: MappedExifData = {};

  for (const [tagName, tag] of Object.entries(tags)) {
    if (tag && typeof tag === 'object' && 'description' in tag) {
      const displayName = getDisplayName(tagName);
      const formattedValue = formatExifValue(tagName, tag.description);

      mapped[tagName] = {
        value: tag.value,
        displayName,
        formattedValue,
      };
    }
  }

  return mapped;
}

/**
 * Get photo information grouped by category
 * @param file - image file with EXIF data
 * @returns EXIF data organized by categories
 */
export async function getGroupedPhotoInfo(
  file: File,
): Promise<GroupedExifData> {
  const { tags } = await parseExifData(file);
  const tagsWithDescriptions: Record<string, unknown> = {};

  // Extract description values for grouping
  for (const [tagName, tag] of Object.entries(tags)) {
    if (tag && typeof tag === 'object' && 'description' in tag) {
      tagsWithDescriptions[tagName] = tag.description;
    }
  }

  return groupByCategory(tagsWithDescriptions);
}

/**
 * Get comprehensive photo information including original, mapped, and grouped data
 * @param file - image file with EXIF data
 * @returns comprehensive photo information
 */
export async function getComprehensivePhotoInfo(file: File) {
  const [original, mapped, grouped] = await Promise.all([
    getPhotoInfo(file, true),
    getMappedPhotoInfo(file),
    getGroupedPhotoInfo(file),
  ]);

  return {
    original,
    mapped,
    grouped,
  };
}
