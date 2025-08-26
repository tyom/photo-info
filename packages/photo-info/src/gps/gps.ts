import type * as ExifReader from 'exifreader';
import { divideByNext } from '../utils/math.ts';
import type {
  Position,
  GPSAccuracy,
  GPSAccuracyGrade,
  GPSSpeed,
} from './types.ts';

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

/**
 * Calculate GPS accuracy grade based on horizontal positioning error
 * @param error - GPS horizontal positioning error in meters (null means excellent accuracy)
 * @returns GPS accuracy grade and description
 */
export function calculateGPSAccuracy(error: number | null): GPSAccuracy | null {
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

/**
 * Get the position of the photo from the EXIF data.
 * @returns The position of the photo as a [latitude, longitude, altitude?] tuple.
 */
export function extractGPSPosition(
  tags: ExifReader.Tags,
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): Position | null {
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
      Array.isArray(value) ? divideByNext(value as number[]) : null,
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

/**
 * Extract GPS speed from EXIF data
 */
export function extractGPSSpeed(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): GPSSpeed | null {
  const gpsSpeedValue = getExifValue('GPSSpeed', 'value', (value) =>
    divideByNext(value as number[]),
  );
  const gpsSpeedRef = getExifValue('GPSSpeedRef', 'description');

  if (gpsSpeedValue !== null && gpsSpeedRef !== null) {
    return {
      value: gpsSpeedValue,
      unit: truncateSpeedUnit(gpsSpeedRef),
    };
  }

  return null;
}

/**
 * Extract GPS bearing/direction from EXIF data
 */
export function extractBearing(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): number | null {
  return getExifValue('GPSImgDirection', 'description', (degrees) =>
    parseFloat((+degrees).toFixed(2)),
  );
}

/**
 * Extract GPS horizontal positioning error
 */
export function extractGPSError(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): number | null {
  return getExifValue('GPSHPositioningError', 'value', (value) =>
    divideByNext(value as number[]),
  );
}

const truncateSpeedUnit = (unit: string) => {
  const units: Record<string, string> = {
    'Kilometers per hour': 'km/h',
  };
  return units[unit] ?? unit;
};
