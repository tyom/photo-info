import { expect, test } from 'vitest';
import { reformatDate } from './date';

test('reformats EXIF date to ISO format', () => {
  expect(reformatDate('2024:10:19 01:01:14')).toEqual('2024-10-19T01:01:14');
  expect(reformatDate('2023:12:31 23:59:59')).toEqual('2023-12-31T23:59:59');
  expect(reformatDate('2020:01:01 00:00:00')).toEqual('2020-01-01T00:00:00');
});

test('handles null input', () => {
  expect(reformatDate(null)).toBeNull();
});

test('handles various date formats', () => {
  expect(reformatDate('2024:06:15 14:30:45')).toEqual('2024-06-15T14:30:45');
  expect(reformatDate('1999:12:31 23:59:59')).toEqual('1999-12-31T23:59:59');
  expect(reformatDate('2023:10:13 10:48:38')).toEqual('2023-10-13T10:48:38');
  // Should return null for empty strings
  expect(reformatDate('')).toBeNull();
});

test('handles dates with hyphens (already formatted)', () => {
  expect(reformatDate('2022-11-12 10:40:00')).toEqual('2022-11-12T10:40:00');
});
