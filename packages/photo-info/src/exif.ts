import * as ExifReader from 'exifreader';
import {
  calculateAngleOfView,
  divideArrayItems,
  isDebugging,
} from './utils.ts';

type Latitude = number;
type Longitude = number;
type Altitude = number;
type Position = [Latitude, Longitude, Altitude?];

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

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

      if (typeof longitude !== 'number' || typeof latitude !== 'number') {
        return null;
      }

      return [
        parseFloat(latitude.toFixed(7)),
        parseFloat(longitude.toFixed(7)),
      ] as Position;
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
 */
export async function getPhotoInfo(file: File) {
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
  const width = getExifValue('Image Width', 'value')!;
  const height = getExifValue('Image Height', 'value')!;
  const frontCamera = !!getExifValue('Lens', 'value')?.includes(' front ');
  const imageOrientation = ['right-top', 'left-top'].includes(
    getExifValue('Orientation', 'description') ?? '',
  );

  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';
  if (width === height) {
    orientation = 'square';
  } else if (height > width || imageOrientation) {
    orientation = 'portrait';
  }

  const result = {
    make: getExifValue('Make', 'description'),
    model: getExifValue('Model', 'description'),
    angleOfView: calculateAngleOfView(focalLength, focalLengthIn35mm),
    focalLength: parseFloat(focalLength.toFixed(2)),
    focalLengthIn35mm,
    gpsPosition,
    gpsSpeed: getExifValue('GPSSpeed', 'value', (value) =>
      divideArrayItems(value as number[]),
    ),
    gpsAltitude: getExifValue('GPSAltitude', 'value', (value) =>
      divideArrayItems(value as number[]),
    ),
    bearing,
    width,
    height,
    orientation,
    frontCamera,
    exposureTime: getExifValue('ExposureTime', 'description'),
    exposureProgram: getExifValue('ExposureProgram', 'description'),
    fNumber: getExifValue('FNumber', 'description'),
    lens:
      getExifValue('Lens', 'value') ?? getExifValue('LensModel', 'description'),
    dateTime: getExifValue('CreateDate', 'value'),
  };

  if (isDebugging) {
    console.log('EXIF data', tags);
    console.log('Extracted data', result);
  }

  return result;
}
