import { expect, test } from 'vitest';
import {
  calculate35mmEquivalentFocalLength,
  calculateAngleOfView,
  calculateCropFactor,
  calculateSensorSize,
  divideByNext,
  reformatDate,
} from './utils';

test('calculates the angle of view for different focal lengths', () => {
  expect(calculateAngleOfView(2.22, 14)).toEqual(102.0721);
  expect(calculateAngleOfView(6.86, 24)).toEqual(71.5716);
  expect(calculateAngleOfView(8.67, 77)).toEqual(25.3513);
  expect(calculateAngleOfView(55)).toEqual(34.9309);
});

test('calculates the 35mm equivalent focal length for different focal lengths', () => {
  expect(calculate35mmEquivalentFocalLength(2.22, 5.6, 4.2)).toEqual(14);
  expect(calculate35mmEquivalentFocalLength(6.86, 9.8, 7.33)).toEqual(24);
  expect(calculate35mmEquivalentFocalLength(9, 4, 3)).toEqual(78);
});

test('calculates the crop factor for different sensor sizes', () => {
  expect(calculateCropFactor(5.6, 4.2)).toEqual(6.18);
  expect(calculateCropFactor(9.8, 7.3)).toEqual(3.54);
  expect(calculateCropFactor(4, 3)).toEqual(8.65);
});

test('calculates sensor size for different focal lengths', () => {
  expect(calculateSensorSize(14, 2.22)).toEqual({ width: 5.49, height: 4.12 });
  expect(calculateSensorSize(24, 6.86)).toEqual({ width: 9.89, height: 7.42 });
  expect(calculateSensorSize(78, 9)).toEqual({ width: 3.99, height: 3 });
});

test('divide array items', () => {
  expect(divideByNext([10, 2, 2])).toEqual(2.5);
  expect(divideByNext([500, 5, 10])).toEqual(10);
  expect(divideByNext([5, 3])).toEqual(1.6667);
  expect(divideByNext([5, 3], 10)).toEqual(1.6666666667);
});

test('format EXIF DateTime format to ISO', () => {
  expect(reformatDate('2023:10:13 10:48:38')).toEqual('2023-10-13T10:48:38');
  expect(reformatDate('2022-11-12 10:40:00')).toEqual('2022-11-12T10:40:00');
  expect(reformatDate('')).toEqual(null);
});
