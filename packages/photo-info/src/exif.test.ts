import { expect, test, vi } from 'vitest';
import * as ExifReader from 'exifreader';
import mockExifSelfie from '@mocks/exif-iphone-14-pro-front.json';
import mockExif14mm from '@mocks/exif-iphone-14-pro-14mm.json';
import mockExif24mm from '@mocks/exif-iphone-14-pro-24mm.json';
import mockExif78mm from '@mocks/exif-iphone-14-pro-78mm.json';
import mockExifPortrait from '@mocks/exif-iphone-14-pro-portrait.json';
import mockExifRightTop from '@mocks/exif-iphone-x-right-top-orientation.json';
import { getPhotoInfo } from './exif';

const fileMock = new File([''], 'photo.jpg');

vi.mock('exifreader');

/** EXIF readings and https://www.dpreview.com/articles/6110937480
13mm - sensor size Type 1/2.55 (5.6x4.2mm)
  focal length = 2.220000028611935 mm
  35mm equivalent focal length = 14 mm
  crop factor = 6.3063063063 (14 / 2.22)

24mm - sensor size Type 1/1.28 (9.8x7.3mm)
  focal length = 6.8600001335175875 mm
  35mm equivalent focal length = 24 mm
  crop factor = 3.4985422741 (24 / 6.86)

77mm - sensor size Type 1/3.5 (4x3mm)
  focal length = 9 mm
  35mm equivalent focal length = 78 mm
  crop factor = 8.6666666667 (78 / 9)
*/

test('returns location data for 14mm lens', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif14mm);

  await expect(getPhotoInfo(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    lens: 'iPhone 14 Pro back triple camera 2.22mm f/2.2',
    dateTime: '2024-10-19T01:01:14',
    exposureProgram: 'Normal program',
    exposureTime: '1/30',
    angleOfView: 102.0721,
    fNumber: 'f/2.2',
    focalLength: 2.22,
    focalLengthIn35mm: 14,
    gpsPosition: [51.5042361, 0.0465306, 6.49],
    gpsAccuracy: {
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    },
    gpsSpeed: { unit: 'km/h', value: 0 },
    bearing: 299.93,
    height: 3024,
    width: 4032,
    orientation: 'landscape',
    frontCamera: false,
  });
});

test('returns location data for 24mm lens', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif24mm);

  await expect(getPhotoInfo(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    lens: 'iPhone 14 Pro back triple camera 6.86mm f/1.78',
    angleOfView: 71.5716,
    focalLength: 6.86,
    focalLengthIn35mm: 24,
    gpsPosition: [51.5042361, 0.0465306, 6.49],
    gpsAccuracy: {
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    },
    gpsSpeed: { unit: 'km/h', value: 0 },
    bearing: 299.93,
    height: 6048,
    width: 8064,
    dateTime: '2024-10-19T01:01:24',
    exposureProgram: 'Normal program',
    exposureTime: '1/20',
    fNumber: 'f/1.78',
    orientation: 'landscape',
    frontCamera: false,
  });
});

test('returns location data for 77mm lens', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif78mm);

  await expect(getPhotoInfo(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    lens: 'iPhone 14 Pro back triple camera 9mm f/2.8',
    angleOfView: 24.9969,
    focalLength: 9,
    focalLengthIn35mm: 78,
    gpsPosition: [51.5042361, 0.0465306, 6.49],
    gpsAccuracy: {
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    },
    gpsSpeed: { unit: 'km/h', value: 0 },
    bearing: 299.93,
    height: 3024,
    width: 4032,
    dateTime: '2024-10-19T01:01:18',
    exposureProgram: 'Normal program',
    exposureTime: '1/17',
    fNumber: 'f/2.8',
    orientation: 'landscape',
    frontCamera: false,
  });
});

test('returns correct orientation for portrait photo based on width and height', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifPortrait);

  await expect(getPhotoInfo(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    lens: 'iPhone 14 Pro back triple camera 9mm f/2.8',
    angleOfView: 25.3608,
    focalLength: 9,
    focalLengthIn35mm: 77,
    gpsPosition: [52.3586194, 4.9417333, 0.37],
    gpsAccuracy: {
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    },
    gpsSpeed: { unit: 'km/h', value: 0.7296 },
    bearing: 306.03,
    height: 4032,
    width: 3024,
    dateTime: '2024-10-13T10:48:38',
    exposureProgram: 'Normal program',
    exposureTime: '1/416',
    fNumber: 'f/2.8',
    orientation: 'portrait',
    frontCamera: false,
  });
});

test('returns correct orientation for portrait photo based on orientation tag', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifRightTop);

  await expect(getPhotoInfo(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone X',
    lens: 'iPhone X back dual camera 4mm f/1.8',
    angleOfView: 63.3907,
    focalLength: 4,
    focalLengthIn35mm: 28,
    gpsPosition: null,
    gpsAccuracy: null,
    gpsSpeed: null,
    bearing: null,
    height: 4032,
    width: 3024,
    dateTime: '2019-08-06T16:56:17',
    exposureProgram: 'Normal program',
    exposureTime: '1/20',
    fNumber: 'f/1.8',
    orientation: 'portrait',
    frontCamera: false,
  });
});

test('returns `frontCamera: true` for selfie', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifSelfie);

  await expect(getPhotoInfo(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    lens: 'iPhone 14 Pro front camera 2.69mm f/1.9',
    angleOfView: 73.944,
    focalLength: 2.69,
    focalLengthIn35mm: 23,
    gpsPosition: [52.3712056, 4.8948222, 1.47],
    gpsAccuracy: {
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    },
    gpsSpeed: { unit: 'km/h', value: 0.2204 },
    bearing: 340.77,
    height: 3024,
    width: 4032,
    dateTime: '2024-10-13T17:14:58',
    exposureProgram: 'Normal program',
    exposureTime: '1/75',
    fNumber: 'f/1.9',
    orientation: 'landscape',
    frontCamera: true,
  });
});

test('returns GPS accuracy grade A for excellent GPS (no error field)', async () => {
  const mockExifNoError = {
    ...mockExif24mm,
    // No GPSHPositioningError field - indicates excellent accuracy
  };

  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifNoError);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsAccuracy).toEqual({
    error: 0,
    grade: 'A',
    description: 'Excellent - No positioning error reported',
  });
});

test('returns GPS accuracy grade A for error < 5 meters', async () => {
  const mockExifLowError = {
    ...mockExif24mm,
    GPSHPositioningError: {
      value: [4, 1], // 4 meters
      description: '4',
    },
  };

  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifLowError);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsAccuracy).toEqual({
    error: 4,
    grade: 'A',
    description: 'Excellent - Strong satellite fix',
  });
});

test('returns GPS accuracy grade B for error 5-10 meters', async () => {
  const mockExifModerateError = {
    ...mockExif24mm,
    GPSHPositioningError: {
      value: [75, 10], // 7.5 meters
      description: '7.5',
    },
  };

  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifModerateError);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsAccuracy).toEqual({
    error: 7.5,
    grade: 'B',
    description: 'Good - Typical smartphone accuracy',
  });
});

test('returns GPS accuracy grade C for error 10-20 meters', async () => {
  const mockExifFairError = {
    ...mockExif24mm,
    GPSHPositioningError: {
      value: [15, 1], // 15 meters
      description: '15',
    },
  };

  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifFairError);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsAccuracy).toEqual({
    error: 15,
    grade: 'C',
    description: 'Fair - Some obstructions',
  });
});

test('returns GPS accuracy grade D for error 20-50 meters', async () => {
  const mockExifHighError = {
    ...mockExif24mm,
    GPSHPositioningError: {
      value: [321713, 9315], // 34.54 meters (your example)
      description: '34.54',
    },
  };

  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifHighError);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsAccuracy).toEqual({
    error: 34.54,
    grade: 'D',
    description: 'Poor - Weak signal or just acquired',
  });
});

test('returns GPS accuracy grade F for error > 50 meters', async () => {
  const mockExifVeryHighError = {
    ...mockExif24mm,
    GPSHPositioningError: {
      value: [75, 1], // 75 meters
      description: '75',
    },
  };

  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifVeryHighError);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsAccuracy).toEqual({
    error: 75,
    grade: 'F',
    description: 'Very poor - Unreliable GPS data',
  });
});

test('returns null GPS accuracy when no GPS position available', async () => {
  // Use mockExifRightTop which has no GPS data
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifRightTop);

  const result = await getPhotoInfo(fileMock);
  expect(result.gpsPosition).toBeNull();
  expect(result.gpsAccuracy).toBeNull();
});
