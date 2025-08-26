import { exifPropertyMappings } from './exif-mappings.ts';

/**
 * Format an EXIF value for display
 */
export function formatExifValue(tagName: string, value: unknown): string {
  const mapping = exifPropertyMappings[tagName];
  if (!mapping) {
    return String(value);
  }

  // Apply custom formatter if available
  if (mapping.format) {
    return mapping.format(value);
  }

  // Add unit if specified
  if (mapping.unit) {
    return `${value} ${mapping.unit}`;
  }

  return String(value);
}
