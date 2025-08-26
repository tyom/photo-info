/**
 * Calculate sensor diagonal from width and height. Defaults to 36mm x 24mm (full frame).
 * @param [width = 36]
 * @param [height = 24]
 */
export function calculateSensorDiagonal(width = 36, height = 24) {
  return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
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
