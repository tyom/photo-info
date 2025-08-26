import type * as ExifReader from 'exifreader';

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

/**
 * Extract image dimensions from EXIF data
 */
export function extractImageDimensions(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): { width: number; height: number } {
  const width = getExifValue('Image Width', 'value') as number | null;
  const height = getExifValue('Image Height', 'value') as number | null;

  // Default dimensions if not available from EXIF
  return {
    width: width ?? 0,
    height: height ?? 0,
  };
}

/**
 * Determine image orientation from dimensions and EXIF orientation tag
 */
export function determineOrientation(
  width: number,
  height: number,
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): {
  orientation: 'portrait' | 'landscape' | 'square';
  adjustedWidth: number;
  adjustedHeight: number;
} {
  const imageOrientation = getExifValue('Orientation', 'description') ?? '';
  const isPortrait = ['right-top', 'left-top'].includes(imageOrientation);

  let orientation: 'portrait' | 'landscape' | 'square' = 'landscape';
  if (width === height) {
    orientation = 'square';
  } else if (height > width || isPortrait) {
    orientation = 'portrait';
  }

  let adjustedWidth = width;
  let adjustedHeight = height;
  // Sometimes the width and the height are not aligned with the orientation
  // Assume that all photos with width > height are portrait
  if (width > height && isPortrait) {
    adjustedWidth = height;
    adjustedHeight = width;
  }

  return { orientation, adjustedWidth, adjustedHeight };
}

/**
 * Extract camera make and model from EXIF data
 */
export function extractCameraInfo(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): { make: string | null; model: string | null } {
  return {
    make: getExifValue('Make', 'description'),
    model: getExifValue('Model', 'description'),
  };
}

/**
 * Extract date/time from EXIF data
 */
export function extractDateTime(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): string | null {
  return getExifValue('DateTime', 'description');
}
