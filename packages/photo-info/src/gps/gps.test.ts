import { describe, test, expect, vi, beforeEach } from 'vitest';
import type * as ExifReader from 'exifreader';
import {
  calculateGPSAccuracy,
  extractGPSPosition,
  extractGPSSpeed,
  extractBearing,
  extractGPSError,
} from './gps';

describe('calculateGPSAccuracy', () => {
  test('returns grade A with excellent description for null error', () => {
    const result = calculateGPSAccuracy(null);
    expect(result).toEqual({
      error: 0,
      grade: 'A',
      description: 'Excellent - No positioning error reported',
    });
  });

  test('returns grade A for error < 5 meters', () => {
    const result = calculateGPSAccuracy(3.5);
    expect(result).toEqual({
      error: 3.5,
      grade: 'A',
      description: 'Excellent - Strong satellite fix',
    });
  });

  test('returns grade B for error between 5 and 10 meters', () => {
    const result = calculateGPSAccuracy(7.8);
    expect(result).toEqual({
      error: 7.8,
      grade: 'B',
      description: 'Good - Typical smartphone accuracy',
    });
  });

  test('returns grade C for error between 10 and 20 meters', () => {
    const result = calculateGPSAccuracy(15);
    expect(result).toEqual({
      error: 15,
      grade: 'C',
      description: 'Fair - Some obstructions',
    });
  });

  test('returns grade D for error between 20 and 50 meters', () => {
    const result = calculateGPSAccuracy(35.456);
    expect(result).toEqual({
      error: 35.46,
      grade: 'D',
      description: 'Poor - Weak signal or just acquired',
    });
  });

  test('returns grade F for error >= 50 meters', () => {
    const result = calculateGPSAccuracy(75.123456);
    expect(result).toEqual({
      error: 75.12,
      grade: 'F',
      description: 'Very poor - Unreliable GPS data',
    });
  });

  test('handles boundary values correctly', () => {
    expect(calculateGPSAccuracy(5)?.grade).toBe('B');
    expect(calculateGPSAccuracy(4.999)?.grade).toBe('A');
    expect(calculateGPSAccuracy(10)?.grade).toBe('C');
    expect(calculateGPSAccuracy(9.999)?.grade).toBe('B');
    expect(calculateGPSAccuracy(20)?.grade).toBe('D');
    expect(calculateGPSAccuracy(19.999)?.grade).toBe('C');
    expect(calculateGPSAccuracy(50)?.grade).toBe('F');
    expect(calculateGPSAccuracy(49.999)?.grade).toBe('D');
  });
});

describe('extractGPSPosition', () => {
  const mockGetExifValue = vi.fn();

  beforeEach(() => {
    mockGetExifValue.mockClear();
  });

  test('returns position with latitude, longitude and altitude', () => {
    const tags = {
      GPSLatitude: {
        id: 2,
        description: '51.5074',
        value: [
          [51, 1],
          [30, 1],
          [26.64, 100],
        ],
      },
      GPSLongitude: {
        id: 4,
        description: '0.1278',
        value: [
          [0, 1],
          [7, 1],
          [40.08, 100],
        ],
      },
      GPSLatitudeRef: { id: 1, description: 'North latitude', value: ['N'] },
      GPSLongitudeRef: { id: 3, description: 'West longitude', value: ['W'] },
      GPSAltitude: { id: 6, description: '100 m', value: [100, 1] },
    } as ExifReader.Tags;

    mockGetExifValue
      .mockReturnValueOnce(-1) // lonRef (W)
      .mockReturnValueOnce(1) // latRef (N)
      .mockReturnValueOnce(-0.1278) // longitude (negative for West)
      .mockReturnValueOnce(51.5074) // latitude
      .mockReturnValueOnce(100); // altitude

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toEqual([51.5074, -0.1278, 100]);
  });

  test('returns position without altitude when altitude is not available', () => {
    const tags = {
      GPSLatitude: {
        id: 2,
        description: '-33.8688',
        value: [
          [33, 1],
          [52, 1],
          [7.68, 100],
        ],
      },
      GPSLongitude: {
        id: 4,
        description: '151.2093',
        value: [
          [151, 1],
          [12, 1],
          [33.48, 100],
        ],
      },
      GPSLatitudeRef: { id: 1, description: 'South latitude', value: ['S'] },
      GPSLongitudeRef: { id: 3, description: 'East longitude', value: ['E'] },
    } as ExifReader.Tags;

    mockGetExifValue
      .mockReturnValueOnce(1) // lonRef (E)
      .mockReturnValueOnce(-1) // latRef (S)
      .mockReturnValueOnce(151.2093) // longitude
      .mockReturnValueOnce(-33.8688) // latitude
      .mockReturnValueOnce(null); // no altitude

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toEqual([-33.8688, 151.2093]);
  });

  test('returns null when GPS tags are missing', () => {
    const tags = {} as ExifReader.Tags;

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toBeNull();
    expect(mockGetExifValue).not.toHaveBeenCalled();
  });

  test('returns null when latitude is not a number', () => {
    const tags = {
      GPSLatitude: {
        id: 2,
        description: 'invalid',
        value: [
          [0, 1],
          [0, 1],
          [0, 1],
        ],
      },
      GPSLongitude: {
        id: 4,
        description: '151.2093',
        value: [
          [151, 1],
          [12, 1],
          [33.48, 100],
        ],
      },
    } as ExifReader.Tags;

    mockGetExifValue
      .mockReturnValueOnce(1) // latRef
      .mockReturnValueOnce(1) // lonRef
      .mockReturnValueOnce(null) // invalid latitude
      .mockReturnValueOnce(151.2093); // longitude

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toBeNull();
  });

  test('returns null when longitude is not a number', () => {
    const tags = {
      GPSLatitude: {
        id: 2,
        description: '51.5074',
        value: [
          [51, 1],
          [30, 1],
          [26.64, 100],
        ],
      },
      GPSLongitude: {
        id: 4,
        description: 'invalid',
        value: [
          [0, 1],
          [0, 1],
          [0, 1],
        ],
      },
    } as ExifReader.Tags;

    mockGetExifValue
      .mockReturnValueOnce(1) // latRef
      .mockReturnValueOnce(1) // lonRef
      .mockReturnValueOnce(51.5074) // latitude
      .mockReturnValueOnce(null); // invalid longitude

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toBeNull();
  });

  test('handles missing reference values', () => {
    const tags = {
      GPSLatitude: {
        id: 2,
        description: '51.5074',
        value: [
          [51, 1],
          [30, 1],
          [26.64, 100],
        ],
      },
      GPSLongitude: {
        id: 4,
        description: '0.1278',
        value: [
          [0, 1],
          [7, 1],
          [40.08, 100],
        ],
      },
    } as ExifReader.Tags;

    mockGetExifValue
      .mockReturnValueOnce(null) // no latRef
      .mockReturnValueOnce(null); // no lonRef

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toBeNull();
  });

  test('rounds coordinates to appropriate precision', () => {
    const tags = {
      GPSLatitude: {
        id: 2,
        description: '51.507412345678',
        value: [
          [51, 1],
          [30, 1],
          [26.6844, 100],
        ],
      },
      GPSLongitude: {
        id: 4,
        description: '0.127812345678',
        value: [
          [0, 1],
          [7, 1],
          [40.1244, 100],
        ],
      },
      GPSLatitudeRef: { id: 1, description: 'North latitude', value: ['N'] },
      GPSLongitudeRef: { id: 3, description: 'East longitude', value: ['E'] },
      GPSAltitude: {
        id: 6,
        description: '123.456789 m',
        value: [123.456789, 1],
      },
    } as ExifReader.Tags;

    mockGetExifValue
      .mockReturnValueOnce(1) // lonRef
      .mockReturnValueOnce(1) // latRef
      .mockReturnValueOnce(0.127812345678) // longitude
      .mockReturnValueOnce(51.507412345678) // latitude
      .mockReturnValueOnce(123.456789); // altitude

    const result = extractGPSPosition(tags, mockGetExifValue);

    expect(result).toEqual([51.5074123, 0.1278123, 123.46]);
  });
});

describe('extractGPSSpeed', () => {
  const mockGetExifValue = vi.fn();

  beforeEach(() => {
    mockGetExifValue.mockClear();
  });

  test('returns GPS speed with km/h unit', () => {
    mockGetExifValue
      .mockReturnValueOnce(65.5) // speed value
      .mockReturnValueOnce('Kilometers per hour'); // speed ref

    const result = extractGPSSpeed(mockGetExifValue);

    expect(result).toEqual({
      value: 65.5,
      unit: 'km/h',
    });
  });

  test('returns GPS speed with non-truncated unit', () => {
    mockGetExifValue
      .mockReturnValueOnce(30) // speed value
      .mockReturnValueOnce('Miles per hour'); // speed ref (not in truncation map)

    const result = extractGPSSpeed(mockGetExifValue);

    expect(result).toEqual({
      value: 30,
      unit: 'Miles per hour',
    });
  });

  test('returns null when speed value is null', () => {
    mockGetExifValue
      .mockReturnValueOnce(null) // no speed value
      .mockReturnValueOnce('Kilometers per hour');

    const result = extractGPSSpeed(mockGetExifValue);

    expect(result).toBeNull();
  });

  test('returns null when speed ref is null', () => {
    mockGetExifValue
      .mockReturnValueOnce(65.5) // speed value
      .mockReturnValueOnce(null); // no speed ref

    const result = extractGPSSpeed(mockGetExifValue);

    expect(result).toBeNull();
  });

  test('returns null when both speed value and ref are null', () => {
    mockGetExifValue.mockReturnValueOnce(null).mockReturnValueOnce(null);

    const result = extractGPSSpeed(mockGetExifValue);

    expect(result).toBeNull();
  });

  test('handles zero speed', () => {
    mockGetExifValue
      .mockReturnValueOnce(0) // speed value
      .mockReturnValueOnce('Kilometers per hour');

    const result = extractGPSSpeed(mockGetExifValue);

    expect(result).toEqual({
      value: 0,
      unit: 'km/h',
    });
  });
});

describe('extractBearing', () => {
  const mockGetExifValue = vi.fn();

  beforeEach(() => {
    mockGetExifValue.mockClear();
  });

  test('returns bearing rounded to 2 decimal places', () => {
    // Mock the getExifValue to apply the transformer
    mockGetExifValue.mockImplementation((tag, key, transformer) => {
      if (tag === 'GPSImgDirection' && key === 'description' && transformer) {
        return transformer('123.456789');
      }
      return null;
    });

    const result = extractBearing(mockGetExifValue);

    expect(result).toBe(123.46);
    expect(mockGetExifValue).toHaveBeenCalledWith(
      'GPSImgDirection',
      'description',
      expect.any(Function),
    );
  });

  test('returns null when bearing is not available', () => {
    mockGetExifValue.mockReturnValueOnce(null);

    const result = extractBearing(mockGetExifValue);

    expect(result).toBeNull();
  });

  test('handles bearing at 0 degrees', () => {
    mockGetExifValue.mockReturnValueOnce(0);

    const result = extractBearing(mockGetExifValue);

    expect(result).toBe(0);
  });

  test('handles bearing at 360 degrees', () => {
    mockGetExifValue.mockReturnValueOnce(360);

    const result = extractBearing(mockGetExifValue);

    expect(result).toBe(360);
  });

  test('transforms string bearing to number', () => {
    mockGetExifValue.mockImplementation((tag, _key, fn) => {
      if (fn && tag === 'GPSImgDirection') {
        return fn('245.789');
      }
      return null;
    });

    const result = extractBearing(mockGetExifValue);

    expect(result).toBe(245.79);
  });
});

describe('extractGPSError', () => {
  const mockGetExifValue = vi.fn();

  beforeEach(() => {
    mockGetExifValue.mockClear();
  });

  test('returns GPS error value', () => {
    mockGetExifValue.mockReturnValueOnce(10.5);

    const result = extractGPSError(mockGetExifValue);

    expect(result).toBe(10.5);
    expect(mockGetExifValue).toHaveBeenCalledWith(
      'GPSHPositioningError',
      'value',
      expect.any(Function),
    );
  });

  test('returns null when GPS error is not available', () => {
    mockGetExifValue.mockReturnValueOnce(null);

    const result = extractGPSError(mockGetExifValue);

    expect(result).toBeNull();
  });

  test('handles zero error', () => {
    mockGetExifValue.mockReturnValueOnce(0);

    const result = extractGPSError(mockGetExifValue);

    expect(result).toBe(0);
  });

  test('processes error value through divideByNext transformer', () => {
    // Mock the transformer behavior
    mockGetExifValue.mockImplementation((tag, key, transformer) => {
      if (tag === 'GPSHPositioningError' && key === 'value' && transformer) {
        // Simulate divideByNext on array [20, 2] = 10
        return transformer([20, 2]);
      }
      return null;
    });

    const result = extractGPSError(mockGetExifValue);

    expect(result).toBe(10);
  });
});
