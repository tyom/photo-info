import { expect, test, vi } from 'vitest';
import * as ExifReader from 'exifreader';
import mockExifSelfie from '@mocks/exif-iphone-14-pro-front.json';
import mockExif14mm from '@mocks/exif-iphone-14-pro-14mm.json';
import mockExif24mm from '@mocks/exif-iphone-14-pro-24mm.json';
import mockExif78mm from '@mocks/exif-iphone-14-pro-78mm.json';
import mockExifPortrait from '@mocks/exif-iphone-14-pro-portrait.json';
import mockExifRightTop from '@mocks/exif-iphone-x-right-top-orientation.json';
import { getPhotoInfo } from './photo-info';

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
    angleOfView: 104.25,
    effectiveAngleOfView: 104.25,
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
    effectiveAngleOfView: 71.5716,
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
    angleOfView: 25.9892,
    effectiveAngleOfView: 25.9892,
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
    angleOfView: 26.3151,
    effectiveAngleOfView: 17.7159,
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
    angleOfView: 65.4705,
    effectiveAngleOfView: 46.3972,
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
    angleOfView: 76.0941,
    effectiveAngleOfView: 76.0941,
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
