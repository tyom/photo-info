import { expect, test } from 'vitest';
import { formatExifValue } from './formatters';

test('formatExifValue formats values correctly', () => {
  // Test raw number formatting
  expect(formatExifValue('FNumber', 1.8)).toBe('f/1.8');
  expect(formatExifValue('FocalLength', 24)).toBe('24 mm');
  expect(formatExifValue('GPSAltitude', 100)).toBe('100 m');

  // Test already formatted values (should not double-format)
  expect(formatExifValue('FNumber', 'f/2.8')).toBe('f/2.8');
  expect(formatExifValue('MaxApertureValue', 'f/1.4')).toBe('f/1.4');

  // Test units
  expect(formatExifValue('FocalLengthIn35mmFilm', 50)).toBe('50 mm');
  expect(formatExifValue('Image Width', 4032)).toBe('4032 px');
  expect(formatExifValue('XResolution', 72)).toBe('72 dpi');
  expect(formatExifValue('GPSHPositioningError', 5.5)).toBe('5.5 m');

  // Test unknown tags
  expect(formatExifValue('UnknownTag', 'some value')).toBe('some value');
  expect(formatExifValue('UnknownTag', 123)).toBe('123');
});
