import type { ExifCategory } from './types.ts';
import { exifPropertyMappings } from './exif-mappings.ts';

/**
 * Group EXIF properties by category
 */
export function groupByCategory(
  tags: Record<string, unknown>,
): Record<ExifCategory, Record<string, unknown>> {
  const grouped: Partial<Record<ExifCategory, Record<string, unknown>>> = {};

  for (const [tagName, value] of Object.entries(tags)) {
    const mapping = exifPropertyMappings[tagName];
    if (mapping) {
      const { category } = mapping;
      if (!grouped[category]) {
        grouped[category] = {};
      }
      grouped[category]![tagName] = value;
    }
  }

  // Return with all categories present (even if empty)
  const allCategories: ExifCategory[] = [
    'camera',
    'lens',
    'exposure',
    'image',
    'gps',
    'time',
    'advanced',
    'vendor',
  ];

  return allCategories.reduce(
    (acc, category) => {
      acc[category] = grouped[category] || {};
      return acc;
    },
    {} as Record<ExifCategory, Record<string, unknown>>,
  );
}
