import { expect, test } from 'vitest';
import { calculateAngleOfView, calculateSensorSize } from './lens';

test('calculates the angle of view for different focal lengths', () => {
  expect(calculateAngleOfView(2.22, 14)).toEqual(102.0721);
  expect(calculateAngleOfView(6.86, 24)).toEqual(71.5716);
  expect(calculateAngleOfView(8.67, 77)).toEqual(25.3513);
  expect(calculateAngleOfView(55)).toEqual(34.9309);
});

test('calculates sensor size for different focal lengths', () => {
  expect(calculateSensorSize(14, 2.22)).toEqual({ width: 5.49, height: 4.12 });
  expect(calculateSensorSize(24, 6.86)).toEqual({ width: 9.89, height: 7.42 });
  expect(calculateSensorSize(78, 9)).toEqual({ width: 3.99, height: 3 });
});
