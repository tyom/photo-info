import {
  extractExposureProgram,
  extractExposureTime,
} from '../camera/exposure.ts';
import {
  calculateAnglesOfView,
  extractFNumber,
  extractFocalLength,
  extractFocalLengthIn35mm,
  extractLensInfo,
} from '../camera/lens.ts';
import { inferSensorAspectRatio } from '../camera/sensor.ts';
import {
  calculateGPSAccuracy,
  extractBearing,
  extractGPSError,
  extractGPSPosition,
  extractGPSSpeed,
} from '../gps/gps.ts';
import { groupByCategory } from '../mappings/categories.ts';
import { getDisplayName } from '../mappings/exif-mappings.ts';
import { formatExifValue } from '../mappings/formatters.ts';
import { reformatDate } from '../utils/date.ts';
import {
  determineOrientation,
  extractCameraInfo,
  extractDateTime,
  extractImageDimensions,
} from '../utils/image.ts';
import { parseExifData } from './parser.ts';
import type { GroupedExifData, MappedExifData, PhotoInfo } from './types.ts';

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
  const { tags, getExifValue } = await parseExifData(file);

  const gpsPosition = extractGPSPosition(tags, getExifValue);
  const bearing = extractBearing(getExifValue);
  const focalLength = extractFocalLength(getExifValue);
  const focalLengthIn35mm = extractFocalLengthIn35mm(getExifValue);
  const { width, height } = extractImageDimensions(getExifValue);
  const { lens, frontCamera } = extractLensInfo(getExifValue);
  const dateTime = extractDateTime(getExifValue);

  const { orientation, adjustedWidth, adjustedHeight } = determineOrientation(
    width,
    height,
    getExifValue,
  );

  // Determine sensor aspect ratio from image dimensions if available
  let aspectRatio: string | undefined;
  if (width && height) {
    aspectRatio = inferSensorAspectRatio(width, height);
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

  let effectiveAngleOfView: number | null = null;

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
      effectiveAngleOfView =
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
      effectiveAngleOfView =
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
      effectiveAngleOfView = parseFloat(
        (verticalRad * (180 / Math.PI)).toFixed(4),
      );
    } else {
      effectiveAngleOfView = angleOfView;
    }
  }

  // Get GPS accuracy information
  const gpsHError = extractGPSError(getExifValue);
  // Only calculate accuracy if we have GPS position data
  const gpsAccuracy = gpsPosition ? calculateGPSAccuracy(gpsHError) : null;

  const { make, model } = extractCameraInfo(getExifValue);

  const result: PhotoInfo = {
    make,
    model,
    angleOfView,
    effectiveAngleOfView,
    focalLength,
    focalLengthIn35mm,
    gpsPosition,
    gpsAccuracy,
    gpsSpeed: extractGPSSpeed(getExifValue),
    bearing,
    width: adjustedWidth,
    height: adjustedHeight,
    orientation,
    frontCamera,
    dateTime: reformatDate(dateTime),
    exposureTime: extractExposureTime(getExifValue),
    exposureProgram: extractExposureProgram(getExifValue),
    fNumber: extractFNumber(getExifValue),
    lens,
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
