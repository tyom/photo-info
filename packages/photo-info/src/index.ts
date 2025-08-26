// Core exports
export {
  getPhotoInfo,
  getMappedPhotoInfo,
  getGroupedPhotoInfo,
  getComprehensivePhotoInfo,
} from './core/photo-info.ts';

export type {
  PhotoInfo,
  MappedExifData,
  GroupedExifData,
  ExifTagName,
  ExifTag,
} from './core/types.ts';

// GPS exports
export type {
  Position,
  GPSAccuracy,
  GPSAccuracyGrade,
  GPSSpeed,
} from './gps/types.ts';

// Visualization exports
export { createFovMarkerSvg } from './visualization/fov-marker.ts';
export type { MarkerOptions } from './visualization/types.ts';

// Mapping exports
export type { ExifCategory, ExifPropertyMapping } from './mappings/types.ts';
export {
  exifPropertyMappings,
  getDisplayName,
  getCategory,
} from './mappings/exif-mappings.ts';
export { formatExifValue } from './mappings/formatters.ts';
export { groupByCategory } from './mappings/categories.ts';

// Utility exports
export {
  calculateSensorSize,
  calculateAngleOfView,
  calculateAnglesOfView,
} from './camera/lens.ts';
export {
  calculateCropFactor,
  calculate35mmEquivalentFocalLength,
  inferSensorAspectRatio,
} from './camera/sensor.ts';
export { reformatDate } from './utils/date.ts';
export { divideByNext } from './utils/math.ts';
