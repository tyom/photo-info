import { expect, test, describe, beforeEach, vi } from 'vitest';
import * as ExifReader from 'exifreader';
import mockExifSelfie from '@mocks/exif-iphone-14-pro-front.json';
import mockExif14mm from '@mocks/exif-iphone-14-pro-14mm.json';
import mockExif24mm from '@mocks/exif-iphone-14-pro-24mm.json';
import mockExif78mm from '@mocks/exif-iphone-14-pro-78mm.json';
import mockExifPortrait from '@mocks/exif-iphone-14-pro-portrait.json';
import mockExifRightTop from '@mocks/exif-iphone-x-right-top-orientation.json';
import {
  getPhotoInfo,
  getMappedPhotoInfo,
  getGroupedPhotoInfo,
  getComprehensivePhotoInfo,
} from './photo-info';

const fileMock = new File([''], 'photo.jpg');

vi.mock('exifreader');

beforeEach(() => {
  vi.clearAllMocks();
});

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

describe('getPhotoInfo - edge cases', () => {
  test('returns photo info with includeOriginalTags', async () => {
    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif24mm);

    const result = await getPhotoInfo(fileMock, true);
    expect(result.originalTags).toBeDefined();
    expect(result.originalTags).toEqual(mockExif24mm);
  });

  test('handles missing GPS data gracefully', async () => {
    const mockDataNoGPS = {
      ...mockExif24mm,
      GPSLatitude: undefined,
      GPSLongitude: undefined,
      GPSAltitude: undefined,
      GPSDOP: undefined,
      GPSSpeed: undefined,
      GPSImgDirection: undefined,
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDataNoGPS);

    const result = await getPhotoInfo(fileMock);
    expect(result.gpsPosition).toBeNull();
    expect(result.gpsAccuracy).toBeNull();
    expect(result.gpsSpeed).toBeNull();
    expect(result.bearing).toBeNull();
  });

  test('handles missing focal length data', async () => {
    const mockDataNoFocalLength = {
      ...mockExif24mm,
      FocalLength: undefined,
      FocalLengthIn35mmFilm: undefined,
      FieldOfView: undefined,
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDataNoFocalLength);

    const result = await getPhotoInfo(fileMock);
    expect(result.focalLength).toBeNull();
    expect(result.focalLengthIn35mm).toBeNull();
    expect(result.angleOfView).toBeNull();
    expect(result.effectiveAngleOfView).toBeNull();
  });

  test('handles missing image dimensions', async () => {
    const mockDataNoDimensions = {
      Make: { description: 'Apple' },
      Model: { description: 'iPhone 14 Pro' },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDataNoDimensions);

    const result = await getPhotoInfo(fileMock);
    // When dimensions are missing, they default to 0
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
    // When both width and height are 0, orientation is square
    expect(result.orientation).toBe('square');
  });

  test('handles EXIF parsing errors gracefully', async () => {
    vi.mocked(ExifReader.load).mockRejectedValueOnce(
      new Error('Invalid EXIF data'),
    );

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getPhotoInfo(fileMock);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse EXIF data for photo.jpg:',
      expect.any(Error),
    );

    expect(result.make).toBeNull();
    expect(result.model).toBeNull();
    expect(result.gpsPosition).toBeNull();
    expect(result.focalLength).toBeNull();

    consoleSpy.mockRestore();
  });

  test('calculates angle of view for DSLR cameras (crop factor < 5)', async () => {
    const mockDSLRData = {
      Make: { description: 'Canon', value: 'Canon' },
      Model: { description: 'Canon EOS 5D', value: 'Canon EOS 5D' },
      FocalLength: { value: [50], description: '50 mm' },
      FocalLengthIn35mmFilm: { value: 50, description: '50 mm' },
      PixelXDimension: { value: 6720 },
      PixelYDimension: { value: 4480 },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDSLRData);

    const result = await getPhotoInfo(fileMock);
    expect(result.focalLength).toBe(50);
    expect(result.focalLengthIn35mm).toBe(50);
    expect(result.angleOfView).toBeDefined();
    expect(result.angleOfView).toBeGreaterThan(30);
    expect(result.angleOfView).toBeLessThan(50);
  });

  test('uses FieldOfView from EXIF when available', async () => {
    const mockDataWithFOV = {
      ...mockExif24mm,
      FieldOfView: { value: 84.0, description: '84.0°' },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDataWithFOV);

    const result = await getPhotoInfo(fileMock);
    expect(result.angleOfView).toBe(84.0);
  });

  test('calculates effective angle of view for portrait orientation with FOV from EXIF', async () => {
    const mockPortraitWithFOV = {
      ...mockExifPortrait,
      FieldOfView: { value: 84.0, description: '84.0°' },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockPortraitWithFOV);

    const result = await getPhotoInfo(fileMock);
    expect(result.angleOfView).toBe(84.0);
    expect(result.effectiveAngleOfView).toBeDefined();
    expect(result.effectiveAngleOfView).not.toBe(result.angleOfView);
  });
});

describe('getMappedPhotoInfo', () => {
  test('returns mapped EXIF data with display names and formatted values', async () => {
    const mockSimpleData = {
      Make: { description: 'Apple', value: 'Apple' },
      Model: { description: 'iPhone 14 Pro', value: 'iPhone 14 Pro' },
      FNumber: { description: 'f/1.78', value: 1.78 },
      ExposureTime: { description: '1/20 sec.', value: 0.05 },
      ISO: { description: '640', value: 640 },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockSimpleData);

    const result = await getMappedPhotoInfo(fileMock);

    expect(result.Make).toEqual({
      value: 'Apple',
      displayName: 'Camera Make',
      formattedValue: 'Apple',
    });

    expect(result.Model).toEqual({
      value: 'iPhone 14 Pro',
      displayName: 'Camera Model',
      formattedValue: 'iPhone 14 Pro',
    });

    expect(result.FNumber).toBeDefined();
    expect(result.ExposureTime).toBeDefined();
    expect(result.ISO).toBeDefined();
  });

  test('handles tags without description gracefully', async () => {
    const mockDataMixed = {
      Make: { description: 'Apple', value: 'Apple' },
      InvalidTag: 'string value',
      NullTag: null,
      UndefinedTag: undefined,
      ObjectWithoutDescription: { value: 'test' },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDataMixed);

    const result = await getMappedPhotoInfo(fileMock);

    expect(result.Make).toBeDefined();
    expect(result.InvalidTag).toBeUndefined();
    expect(result.NullTag).toBeUndefined();
    expect(result.UndefinedTag).toBeUndefined();
    expect(result.ObjectWithoutDescription).toBeUndefined();
  });
});

describe('getGroupedPhotoInfo', () => {
  test('returns EXIF data grouped by categories', async () => {
    const mockDataForGrouping = {
      Make: { description: 'Apple', value: 'Apple' },
      Model: { description: 'iPhone 14 Pro', value: 'iPhone 14 Pro' },
      ExposureTime: { description: '1/20', value: 0.05 },
      FNumber: { description: 'f/1.78', value: 1.78 },
      ISO: { description: '640', value: 640 },
      GPSLatitude: { description: '51.5042', value: 51.5042 },
      GPSLongitude: { description: '0.0465', value: 0.0465 },
      DateTimeOriginal: {
        description: '2024:10:19 01:01:24',
        value: '2024:10:19 01:01:24',
      },
    };

    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce(mockDataForGrouping);

    const result = await getGroupedPhotoInfo(fileMock);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    // Grouped data should have category keys
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  test('handles empty EXIF data', async () => {
    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValueOnce({});

    const result = await getGroupedPhotoInfo(fileMock);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});

describe('getComprehensivePhotoInfo', () => {
  test('returns all three types of photo information', async () => {
    // @ts-expect-error partial mock with JSON
    vi.mocked(ExifReader.load).mockResolvedValue(mockExif24mm);

    const result = await getComprehensivePhotoInfo(fileMock);

    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('mapped');
    expect(result).toHaveProperty('grouped');

    expect(result.original).toHaveProperty('make');
    expect(result.original).toHaveProperty('model');
    expect(result.original).toHaveProperty('originalTags');

    expect(result.mapped).toBeDefined();
    expect(typeof result.mapped).toBe('object');

    expect(result.grouped).toBeDefined();
    expect(typeof result.grouped).toBe('object');
  });

  test('handles errors gracefully in comprehensive info', async () => {
    vi.mocked(ExifReader.load).mockRejectedValue(new Error('Parse error'));

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getComprehensivePhotoInfo(fileMock);

    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('mapped');
    expect(result).toHaveProperty('grouped');

    expect(result.original.make).toBeNull();
    expect(result.original.model).toBeNull();

    consoleSpy.mockRestore();
  });
});
