import { expect, test } from 'vitest';
import { groupByCategory } from './categories';

test('groupByCategory groups EXIF data by category', () => {
  const tags = {
    Make: 'Canon',
    Model: 'EOS R5',
    FNumber: 'f/2.8',
    ExposureTime: '1/250',
    ISO: '400',
    FocalLength: '50mm',
    LensModel: 'RF 50mm f/1.2L USM',
    GPSLatitude: 51.5074,
    GPSLongitude: -0.1278,
    DateTime: '2024-01-15T10:30:00',
    UnknownTag: 'some value',
  };

  const grouped = groupByCategory(tags);

  // Check camera category
  expect(grouped.camera).toEqual({
    Make: 'Canon',
    Model: 'EOS R5',
  });

  // Check exposure category
  expect(grouped.exposure).toEqual({
    FNumber: 'f/2.8',
    ExposureTime: '1/250',
  });

  // Check lens category
  expect(grouped.lens).toEqual({
    FocalLength: '50mm',
    LensModel: 'RF 50mm f/1.2L USM',
  });

  // Check GPS category
  expect(grouped.gps).toEqual({
    GPSLatitude: 51.5074,
    GPSLongitude: -0.1278,
  });

  // Check time category
  expect(grouped.time).toEqual({
    DateTime: '2024-01-15T10:30:00',
  });

  // Check that unknown tags are not included
  expect(grouped.camera).not.toHaveProperty('UnknownTag');
  expect(grouped.exposure).not.toHaveProperty('UnknownTag');

  // Check empty categories exist
  expect(grouped.image).toEqual({});
  expect(grouped.advanced).toEqual({});
  expect(grouped.vendor).toEqual({});
});

test('handles empty input', () => {
  const grouped = groupByCategory({});

  expect(grouped.camera).toEqual({});
  expect(grouped.exposure).toEqual({});
  expect(grouped.lens).toEqual({});
  expect(grouped.gps).toEqual({});
  expect(grouped.time).toEqual({});
  expect(grouped.image).toEqual({});
  expect(grouped.advanced).toEqual({});
  expect(grouped.vendor).toEqual({});
});

test('ignores unmapped tags', () => {
  const tags = {
    CustomTag1: 'value1',
    CustomTag2: 'value2',
    Make: 'Sony',
  };

  const grouped = groupByCategory(tags);

  expect(grouped.camera).toEqual({ Make: 'Sony' });
  expect(grouped.exposure).toEqual({});
  // Custom tags should not appear in any category
  Object.values(grouped).forEach((category) => {
    expect(category).not.toHaveProperty('CustomTag1');
    expect(category).not.toHaveProperty('CustomTag2');
  });
});
