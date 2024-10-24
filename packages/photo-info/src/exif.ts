import * as ExifReader from 'exifreader';
import {
  calculateAngleOfView,
  divideArrayItems,
  reformatDate,
} from './utils.ts';

type Latitude = number;
type Longitude = number;
type Altitude = number;
export type Position = [Latitude, Longitude, Altitude?];

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

type PhotoInfo = {
  make: string | null;
  model: string | null;
  angleOfView: number | null;
  focalLength: number | null;
  focalLengthIn35mm: number;
  gpsPosition: Position | null;
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

const truncateSpeedUnit = (unit: string) => {
  const units: Record<string, string> = {
    'Kilometers per hour': 'km/h',
  };
  return units[unit] ?? unit;
};

async function parseExifData(file: File) {
  const tags = await ExifReader.load(file);

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
      const longitude = getExifValue(
        'GPSLongitude',
        'description',
        (long) => +long * lonRef!,
      );
      const latitude = getExifValue(
        'GPSLatitude',
        'description',
        (lat) => +lat * latRef!,
      );
      const altitude = getExifValue('GPSAltitude', 'value', (value) =>
        divideArrayItems(value as number[]),
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
    divideArrayItems(value as number[]),
  )!;
  const focalLengthIn35mm = getExifValue(
    'FocalLengthIn35mmFilm',
    'value',
  ) as number;
  const width = getExifValue('Image Width', 'value') as number;
  const height = getExifValue('Image Height', 'value') as number;
  const frontCamera = !!getExifValue('Lens', 'value')?.includes(' front ');
  const imageOrientation = ['right-top', 'left-top'].includes(
    getExifValue('Orientation', 'description') ?? '',
  );
  const dateTime = getExifValue('DateTime', 'description');

  let fNumber = getExifValue('FNumber', 'description');
  if (fNumber) {
    fNumber = fNumber.substring(0, 8);
  }

  let gpsSpeed: { value: number; unit: string } | null = null;
  if (getExifValue('GPSSpeed', 'value')) {
    gpsSpeed = {
      value: getExifValue('GPSSpeed', 'value', (value) =>
        divideArrayItems(value as number[]),
      )!,
      unit: truncateSpeedUnit(getExifValue('GPSSpeedRef', 'description')!),
    };
  }

  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';
  if (width === height) {
    orientation = 'square';
  } else if (height > width || imageOrientation) {
    orientation = 'portrait';
  }

  const result: PhotoInfo = {
    make: getExifValue('Make', 'description'),
    model: getExifValue('Model', 'description'),
    angleOfView: calculateAngleOfView(focalLength, focalLengthIn35mm),
    focalLength: focalLength ? parseFloat(focalLength.toFixed(2)) : null,
    focalLengthIn35mm,
    gpsPosition,
    gpsSpeed,
    bearing,
    width,
    height,
    orientation,
    frontCamera,
    dateTime: reformatDate(dateTime),
    exposureTime: getExifValue('ExposureTime', 'description'),
    exposureProgram: getExifValue('ExposureProgram', 'description'),
    fNumber,
    lens:
      getExifValue('Lens', 'value') ?? getExifValue('LensModel', 'description'),
  };

  if (includeOriginalTags) {
    result.originalTags = tags;
  }

  return result;
}
