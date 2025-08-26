import type * as ExifReader from 'exifreader';

type ExifTagName = keyof ExifReader.Tags;
type ExifTag = ExifReader.Tags[ExifTagName];

/**
 * Extract exposure time from EXIF data
 */
export function extractExposureTime(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): string | null {
  return getExifValue('ExposureTime', 'description');
}

/**
 * Extract exposure program from EXIF data
 */
export function extractExposureProgram(
  getExifValue: <K extends keyof ExifTag = keyof ExifTag, V = ExifTag[K]>(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ) => V | null,
): string | null {
  return getExifValue('ExposureProgram', 'description');
}
