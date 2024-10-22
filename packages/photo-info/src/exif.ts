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

/**
 * Get the location information from the EXIF data of a photo.
 * @param file
 */
export async function getPhotoLocationData(file: File) {
  const tags = await ExifReader.load(file);

  let longitude: number | null = null;
  let latitude: number | null = null;
  let bearing: number | null = null;
  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';

  // const lon = getExifValue(tags, 'GPSLongitude', (value) => value * 1);

  if ('GPSLongitude' in tags) {
    const lonRef =
      (tags['GPSLongitudeRef']?.value as string[])[0] === 'E' ? 1 : -1;
    const latRef =
      (tags['GPSLatitudeRef']?.value as string[])[0] === 'N' ? 1 : -1;
    longitude =
      (tags['GPSLongitude']?.description as unknown as number) * lonRef;
    latitude = (tags['GPSLatitude']?.description as unknown as number) * latRef;
    bearing = divideArrayItems(tags['GPSImgDirection']?.value as number[]);

    bearing = parseFloat(bearing.toFixed(2));
    latitude = parseFloat(latitude.toFixed(7));
    longitude = parseFloat(longitude.toFixed(7));
  }

  const focalLength = divideArrayItems(tags['FocalLength']?.value as number[]);
  const focalLengthIn35mm = tags['FocalLengthIn35mmFilm']?.value as number;
  const width = tags['Image Width']?.value as number;
  const height = tags['Image Height']?.value as number;
  const frontCamera = !!(tags['Lens']?.value as string)?.includes(' front ');
  const portraitOrientation = ['right-top', 'left-top'].includes(
    tags['Orientation']?.description ?? '',
  );
  const make = tags['Make']?.description ?? null;
  const model = tags['Model']?.description ?? null;

  if (width === height) {
    orientation = 'square';
  } else if (height > width || portraitOrientation) {
    orientation = 'portrait';
  }

  const result = {
    make,
    model,
    angleOfView: calculateAngleOfView(focalLength, focalLengthIn35mm),
    focalLength: parseFloat(focalLength.toFixed(2)),
    focalLengthIn35mm,
    position:
      latitude && longitude ? ([latitude, longitude] as Position) : null,
    bearing,
    width,
    height,
    orientation,
    frontCamera,
  };

  if (isDebugging) {
    console.log('EXIF data', tags);
    console.log('Extracted data', result);
  }

  return result;
}
