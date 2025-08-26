import { expect, test } from 'vitest';
import {
  calculate35mmEquivalentFocalLength,
  calculateCropFactor,
  inferSensorAspectRatio,
} from './sensor';

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

test('infers sensor aspect ratio from image dimensions', () => {
  // Common 3:2 ratio (DSLRs)
  expect(inferSensorAspectRatio(6000, 4000)).toEqual('3:2');
  expect(inferSensorAspectRatio(4000, 6000)).toEqual('3:2'); // Portrait

  // Common 4:3 ratio (Micro Four Thirds, phones)
  expect(inferSensorAspectRatio(4032, 3024)).toEqual('4:3');
  expect(inferSensorAspectRatio(3024, 4032)).toEqual('4:3'); // Portrait

  // 16:9 ratio (video)
  expect(inferSensorAspectRatio(1920, 1080)).toEqual('16:9');
  expect(inferSensorAspectRatio(3840, 2160)).toEqual('16:9');

  // 1:1 ratio (square)
  expect(inferSensorAspectRatio(3000, 3000)).toEqual('1:1');

  // 5:4 ratio (medium format)
  expect(inferSensorAspectRatio(5000, 4000)).toEqual('5:4');

  // Unusual ratio - defaults to closest standard
  expect(inferSensorAspectRatio(5000, 3000)).toEqual('3:2'); // 1.67 is closer to 1.5
  expect(inferSensorAspectRatio(4000, 3200)).toEqual('5:4'); // 1.25 exactly
});

test('handles edge cases for aspect ratio inference', () => {
  // Very unusual ratios default to 3:2 or 4:3
  expect(inferSensorAspectRatio(10000, 2000)).toEqual('3:2'); // Very wide
  expect(inferSensorAspectRatio(2000, 1600)).toEqual('5:4'); // Close to 5:4
});
