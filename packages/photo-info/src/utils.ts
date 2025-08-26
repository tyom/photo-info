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
 * Determine the sensor aspect ratio based on image dimensions.
 * Common sensor aspect ratios:
 * - 3:2 for DSLRs (Canon, Nikon full frame and APS-C)
 * - 4:3 for Micro Four Thirds and many phones
 * - 16:9 for video/cinema
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Aspect ratio string like "3:2" or "4:3"
 */
export function inferSensorAspectRatio(width: number, height: number): string {
  // Calculate the aspect ratio
  const ratio = Math.max(width, height) / Math.min(width, height);

  // Common aspect ratios and their decimal values
  const commonRatios = [
    { format: '3:2', value: 3 / 2 }, // 1.5 - DSLRs
    { format: '4:3', value: 4 / 3 }, // 1.333... - Micro Four Thirds, phones
    { format: '16:9', value: 16 / 9 }, // 1.777... - Video/cinema
    { format: '5:4', value: 5 / 4 }, // 1.25 - Some medium format
    { format: '1:1', value: 1 }, // 1.0 - Square format
  ];

  // Find the closest match
  let closestRatio = commonRatios[0];
  let smallestDiff = Math.abs(ratio - closestRatio.value);

  for (const r of commonRatios) {
    const diff = Math.abs(ratio - r.value);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestRatio = r;
    }
  }

  // If the difference is too large (> 0.05), default to 3:2 for DSLRs or 4:3 for others
  if (smallestDiff > 0.05) {
    // Check if it's closer to 3:2 or 4:3
    return Math.abs(ratio - 1.5) < Math.abs(ratio - 1.333) ? '3:2' : '4:3';
  }

  return closestRatio.format;
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
 * Divides a number in an array of numbers by the next item.
 * @param items - array of numbers
 * @param precision - number of decimal places to round to
 */
export const divideByNext = (items: number[], precision = 4) =>
  parseFloat(items.reduce((a, c) => a / c).toFixed(precision));

/**
 * Reformats a date string from the format "YYYY:MM:DD HH:MM:SS" fround in EXIF data to "YYYY-MM-DDTHH:MM:SS".
 * @param input
 */
export function reformatDate(input: string | null) {
  if (!input) return null;

  const [date, time] = input.split(' ');
  const formattedDate = date.replace(/:/g, '-');
  return `${formattedDate}T${time}`;
}
