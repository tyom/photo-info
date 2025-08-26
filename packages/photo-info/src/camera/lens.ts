import type * as ExifReader from 'exifreader';
import { divideByNext } from '../utils/math.ts';

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

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
 * Calculate the horizontal angle of view for a given focal length and sensor width.
 * @param focalLength
 * @param focalLengthIn35mm - 35mm equivalent focal length.
 * @param aspectRatio - Optional aspect ratio in the format "width:height". If not provided, defaults to "4:3".
 */
export function calculateAngleOfView(
  focalLength: number,
  focalLengthIn35mm?: number | null,
  aspectRatio?: string,
) {
  // Calculate the sensor width on 35mm focal length equivalent if available
  // Otherwise, use the actual focal length
  const { width } = calculateSensorSize(
    focalLengthIn35mm ?? focalLength,
    focalLength,
    aspectRatio,
  );

  const fov = 2 * Math.atan(width / (2 * focalLength));
  const fovDegrees = fov * (180 / Math.PI);

  return fovDegrees ? parseFloat(fovDegrees.toFixed(4)) : null;
}

/**
 * Calculate both horizontal and vertical angles of view.
 * @param focalLength
 * @param focalLengthIn35mm - 35mm equivalent focal length.
 * @param aspectRatio - Optional aspect ratio in the format "width:height". If not provided, defaults to "4:3".
 * @returns Object with horizontal and vertical FOV in degrees
 */
export function calculateAnglesOfView(
  focalLength: number,
  focalLengthIn35mm?: number | null,
  aspectRatio?: string,
): { horizontal: number | null; vertical: number | null } {
  // Calculate the sensor dimensions on 35mm focal length equivalent if available
  const { width, height } = calculateSensorSize(
    focalLengthIn35mm ?? focalLength,
    focalLength,
    aspectRatio,
  );

  const horizontalFov = 2 * Math.atan(width / (2 * focalLength));
  const verticalFov = 2 * Math.atan(height / (2 * focalLength));

  const horizontalDegrees = horizontalFov * (180 / Math.PI);
  const verticalDegrees = verticalFov * (180 / Math.PI);

  return {
    horizontal: horizontalDegrees
      ? parseFloat(horizontalDegrees.toFixed(4))
      : null,
    vertical: verticalDegrees ? parseFloat(verticalDegrees.toFixed(4)) : null,
  };
}

/**
 * Extract focal length from EXIF data
 */
export function extractFocalLength(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): number | null {
  const focalLength = getExifValue('FocalLength', 'value', (value) =>
    Array.isArray(value) ? divideByNext(value as number[]) : null,
  );
  return focalLength ? parseFloat(focalLength.toFixed(2)) : null;
}

/**
 * Extract 35mm equivalent focal length from EXIF data
 */
export function extractFocalLengthIn35mm(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): number | null {
  return getExifValue('FocalLengthIn35mmFilm', 'value') as number | null;
}

/**
 * Extract f-number/aperture from EXIF data
 */
export function extractFNumber(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): string | null {
  const fNumber = getExifValue('FNumber', 'value', (value) =>
    Array.isArray(value) ? divideByNext(value as number[]) : null,
  );
  return fNumber ? `f/${fNumber}` : null;
}

/**
 * Extract lens information from EXIF data
 */
export function extractLensInfo(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): { lens: string | null; frontCamera: boolean } {
  const lens =
    getExifValue('Lens', 'value') ?? getExifValue('LensModel', 'description');
  const frontCamera = !!getExifValue('Lens', 'value')?.includes(' front ');

  return { lens, frontCamera };
}
