import * as ExifReader from 'exifreader';

const isDebugging = ['1', 'true'].includes(process.env.DEBUG ?? '');

/**
 * Calculate sensor diagonal from width and height. Defaults to 36mm x 24mm (full frame).
 * @param [width = 36]
 * @param [height = 24]
 */
function calculateSensorDiagonal(width = 36, height = 24) {
  return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
}

/**
 * Calculate the estimated sensor size from 35mm equivalent focal length and real focal length using the aspect ratio.
 * @param focalLengthIn35mm - 35mm equivalent focal length.
 * @param focalLength - Real focal length.
 * @param [aspectRatio = '4:3'] - In the format of "width:height".
 * @returns The estimated sensor size in millimeters of width and height to 2 decimal places.
 */
export function calculateSensorSize(
  focalLengthIn35mm: number,
  focalLength: number,
  aspectRatio = '4:3',
) {
  const cropFactor = focalLengthIn35mm / focalLength;
  const sensorDiagonal = calculateSensorDiagonal() / cropFactor;
  const [aspectRatioWidth, aspectRatioHeight] = aspectRatio
    .split(':')
    .map(Number);
  const aspectRatioDiagonal = Math.sqrt(
    Math.pow(aspectRatioWidth, 2) + Math.pow(aspectRatioHeight, 2),
  );
  const width = sensorDiagonal * (aspectRatioWidth / aspectRatioDiagonal);
  const height = sensorDiagonal * (aspectRatioHeight / aspectRatioDiagonal);

  return {
    width: parseFloat(width.toFixed(2)),
    height: parseFloat(height.toFixed(2)),
  };
}

/**
 * Calculate crop factor for 35mm (1x) from a given sensor width and height.
 * @param sensorWidth
 * @param sensorHeight
 */
export function calculateCropFactor(sensorWidth: number, sensorHeight: number) {
  const sensor35mmDiagonal = calculateSensorDiagonal();
  const sensorDiagonal = calculateSensorDiagonal(sensorWidth, sensorHeight);
  const cropFactor = sensor35mmDiagonal / sensorDiagonal;
  return parseFloat(cropFactor.toFixed(2));
}

/**
 * Calculate 35mm equivalent focal length from a given focal length, sensor width, and sensor height.
 * @param focalLength
 * @param sensorWidth
 * @param sensorHeight
 *
 * @returns 35mm equivalent focal length (rounded).
 */
export function calculate35mmEquivalentFocalLength(
  focalLength: number,
  sensorWidth: number,
  sensorHeight: number,
) {
  const equivalentFocalLength =
    focalLength * calculateCropFactor(sensorWidth, sensorHeight);

  return Math.round(equivalentFocalLength);
}

/**
 * Calculate the horizontal angle of view for a given focal length and sensor width.
 * @param focalLength
 * @param focalLengthIn35mm - 35mm equivalent focal length.
 */
export function calculateAngleOfView(
  focalLength: number,
  focalLengthIn35mm: number,
) {
  const { width } = calculateSensorSize(focalLengthIn35mm, focalLength);

  const fov = 2 * Math.atan(width / (2 * focalLength));
  const fovDegrees = fov * (180 / Math.PI);

  return parseFloat(fovDegrees.toFixed(4));
}

const divideArrayItems = (items: number[]) => items.reduce((a, c) => a / c);

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
