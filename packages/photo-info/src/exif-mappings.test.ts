import { expect, test } from 'vitest';
import {
  getDisplayName,
  getCategory,
  formatExifValue,
  groupByCategory,
} from './exif-mappings';

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

test('formatExifValue formats values correctly', () => {
  // Test raw number formatting
  expect(formatExifValue('FNumber', 1.8)).toBe('f/1.8');
  expect(formatExifValue('FocalLength', 24)).toBe('24mm');
  expect(formatExifValue('ISOSpeedRatings', 400)).toBe('400');
  expect(formatExifValue('GPSAltitude', 100)).toBe('100m');
  expect(formatExifValue('UnknownTag', 'test')).toBe('test');

  // Test that already formatted aperture values are not double-formatted
  expect(formatExifValue('FNumber', 'f/2.8')).toBe('f/2.8');
  expect(formatExifValue('FNumber', 'f/1.4')).toBe('f/1.4');
  expect(formatExifValue('MaxApertureValue', 'f/1.8')).toBe('f/1.8');
});

test('groupByCategory organizes tags properly', () => {
  const tags = {
    Make: 'Canon',
    Model: 'EOS R5',
    FNumber: 'f/2.8',
    ExposureTime: '1/250',
    ISOSpeedRatings: 800,
    GPSLatitude: 40.7128,
    GPSLongitude: -74.006,
    DateTime: '2024-01-15 14:30:00',
  };

  const grouped = groupByCategory(tags);

  expect(grouped.camera).toEqual({
    'Camera Make': 'Canon',
    'Camera Model': 'EOS R5',
  });

  expect(grouped.exposure).toEqual({
    Aperture: 'f/2.8',
    'Shutter Speed': '1/250',
    ISO: '800',
  });

  expect(grouped.gps).toEqual({
    Latitude: '40.7128',
    Longitude: '-74.006',
  });

  expect(grouped.time).toEqual({
    'Date/Time Modified': '2024-01-15 14:30:00',
  });

  // Check that empty categories are removed
  expect(grouped.vendor).toBeUndefined();
});
