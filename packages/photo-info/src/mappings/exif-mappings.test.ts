import { expect, test } from 'vitest';
import { getDisplayName, getCategory } from './exif-mappings';

test('getDisplayName returns user-friendly names', () => {
  expect(getDisplayName('FNumber')).toBe('Aperture');
  expect(getDisplayName('ExposureTime')).toBe('Shutter Speed');
  expect(getDisplayName('ISOSpeedRatings')).toBe('ISO');
  expect(getDisplayName('Make')).toBe('Camera Make');
  expect(getDisplayName('Model')).toBe('Camera Model');
  expect(getDisplayName('UnknownTag')).toBe('UnknownTag'); // Falls back to original
});

test('getCategory returns correct categories', () => {
  expect(getCategory('FNumber')).toBe('exposure');
  expect(getCategory('Make')).toBe('camera');
  expect(getCategory('LensModel')).toBe('lens');
  expect(getCategory('GPSLatitude')).toBe('gps');
  expect(getCategory('DateTime')).toBe('time');
  expect(getCategory('UnknownTag')).toBeUndefined();
});
