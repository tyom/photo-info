import { expect, test, vi } from 'vitest';
import * as ExifReader from 'exifreader';
import mockExifSelfie from '@mocks/exif-iphone-14-pro-front.json';
import mockExif14mm from '@mocks/exif-iphone-14-pro-14mm.json';
import mockExif24mm from '@mocks/exif-iphone-14-pro-24mm.json';
import mockExif78mm from '@mocks/exif-iphone-14-pro-78mm.json';
import mockExifPortrait from '@mocks/exif-iphone-14-pro-portrait.json';
import mockExifRightTop from '@mocks/exif-iphone-x-right-top-orientation.json';
import { getPhotoLocationData } from './exif';

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

  await expect(getPhotoLocationData(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    angleOfView: 102.0721,
    focalLength: 2.22,
    focalLengthIn35mm: 14,
    position: [51.5042361, 0.0465306],
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

  await expect(getPhotoLocationData(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    angleOfView: 71.5716,
    focalLength: 6.86,
    focalLengthIn35mm: 24,
    position: [51.5042361, 0.0465306],
    bearing: 299.93,
    height: 6048,
    width: 8064,
    orientation: 'landscape',
    frontCamera: false,
  });
});

test('returns location data for 77mm lens', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif78mm);

  await expect(getPhotoLocationData(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    angleOfView: 24.9969,
    focalLength: 9,
    focalLengthIn35mm: 78,
    position: [51.5042361, 0.0465306],
    bearing: 299.93,
    height: 3024,
    width: 4032,
    orientation: 'landscape',
    frontCamera: false,
  });
});

test('returns correct orientation for portrait photo based on width and height', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifPortrait);

  await expect(getPhotoLocationData(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    angleOfView: 25.3608,
    focalLength: 9,
    focalLengthIn35mm: 77,
    position: [52.3586194, 4.9417333],
    bearing: 306.03,
    height: 4032,
    width: 3024,
    orientation: 'portrait',
    frontCamera: false,
  });
});

test('returns correct orientation for portrait photo based on orientation tag', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifRightTop);

  await expect(getPhotoLocationData(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone X',
    angleOfView: 63.3907,
    focalLength: 4,
    focalLengthIn35mm: 28,
    position: null,
    bearing: null,
    height: 3024,
    width: 4032,
    orientation: 'portrait',
    frontCamera: false,
  });
});

test('returns `frontCamera: true` for selfie', async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifSelfie);

  await expect(getPhotoLocationData(fileMock)).resolves.toEqual({
    make: 'Apple',
    model: 'iPhone 14 Pro',
    angleOfView: 73.944,
    focalLength: 2.69,
    focalLengthIn35mm: 23,
    position: [52.3712056, 4.8948222],
    bearing: 340.77,
    height: 3024,
    width: 4032,
    orientation: 'landscape',
    frontCamera: true,
  });
});
