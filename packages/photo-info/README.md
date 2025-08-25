# Photo Info

[![npm version](https://img.shields.io/npm/v/photo-info.svg?style=flat-square)](https://www.npmjs.com/package/photo-info)
[![Build](https://github.com/tyom/photo-info/actions/workflows/build.yaml/badge.svg)](https://github.com/tyom/photo-info/actions/workflows/build.yaml)

This package provides a function to extract useful information from photos, such as geo location, camera make and model,
focal length and angle of view, which could be useful to orient the photo on the map.

## Demo App

Try the [demo app](https://tyom.github.io/photo-info/) with a few geotagged photos. All photos operations are done in the browser.
No data is sent to any server.

## Installation

```bash
npm install photo-info
```

## Usage

### Basic Usage

```ts
import { getPhotoInfo } from 'photo-info';

const photoInfo = await getPhotoInfo(file);
console.log(photoInfo);
// {
//   make: 'Apple',
//   model: 'iPhone 15 Pro',
//   angleOfView: 23.5,
//   bearing: 45.2,
//   gpsPosition: [51.5074, -0.1276, 10.5],
//   gpsSpeed: { value: 5.4, unit: 'km/h' },
//   focalLength: 6.86,
//   focalLengthIn35mm: 48,
//   width: 4032,
//   height: 3024,
//   orientation: 'landscape',
//   frontCamera: false,
//   dateTime: '2024-03-15T14:30:00',
//   exposureTime: '1/120',
//   exposureProgram: 'Normal program',
//   fNumber: 'f/1.8',
//   lens: 'iPhone 15 Pro back camera 6.86mm f/1.78'
// }
```

### Including Original EXIF Tags

```ts
const { originalTags, ...photoInfo } = await getPhotoInfo(file, true);
```

## API Reference

### `getPhotoInfo(file: File, includeOriginalTags?: boolean): Promise<PhotoInfo>`

Extracts photo information from an image file containing EXIF data.

#### Parameters

- `file` - A File object (typically from an input element or drag-and-drop)
- `includeOriginalTags` - Optional. When `true`, includes the raw EXIF data in the response

#### Returns

A `PhotoInfo` object with the following properties:

| Property            | Type                                    | Description                                             |
| ------------------- | --------------------------------------- | ------------------------------------------------------- |
| `make`              | `string \| null`                        | Camera manufacturer (e.g., "Canon", "Apple")            |
| `model`             | `string \| null`                        | Camera model (e.g., "iPhone 15 Pro")                    |
| `angleOfView`       | `number \| null`                        | Horizontal angle of view in degrees                     |
| `bearing`           | `number \| null`                        | Compass direction the camera was facing (0-360°)        |
| `gpsPosition`       | `[lat, lng, alt?] \| null`              | GPS coordinates: latitude, longitude, altitude (meters) |
| `gpsSpeed`          | `{value, unit} \| null`                 | Speed at capture time with unit (typically "km/h")      |
| `focalLength`       | `number \| null`                        | Actual focal length in millimeters                      |
| `focalLengthIn35mm` | `number \| null`                        | 35mm equivalent focal length                            |
| `width`             | `number`                                | Image width in pixels                                   |
| `height`            | `number`                                | Image height in pixels                                  |
| `orientation`       | `'portrait' \| 'landscape' \| 'square'` | Image orientation                                       |
| `frontCamera`       | `boolean`                               | Whether taken with front-facing camera                  |
| `dateTime`          | `string \| null`                        | ISO 8601 formatted capture time                         |
| `exposureTime`      | `string \| null`                        | Shutter speed (e.g., "1/120")                           |
| `exposureProgram`   | `string \| null`                        | Camera exposure mode                                    |
| `fNumber`           | `string \| null`                        | Aperture value (e.g., "f/1.8")                          |
| `lens`              | `string \| null`                        | Lens model/description                                  |
| `originalTags`      | `object \| undefined`                   | Raw EXIF data (when requested)                          |

### `createFovMarkerSvg(options: MarkerOptions): string`

Creates an SVG string for visualizing photo field-of-view on maps.

```ts
import { createFovMarkerSvg } from 'photo-info';

const svgString = createFovMarkerSvg({
  angleOfView: 65,
  bearing: 180,
  circleColor: 'red',
  fovColor: 'rgba(255, 0, 0, 0.3)',
});

// Use with Leaflet, Mapbox, or other mapping libraries
```

#### Options

- `angleOfView` - Field of view angle in degrees
- `bearing` - Direction in degrees (0-360)
- `viewBoxSize` - SVG viewbox size (default: 200)
- `circleSize` - Center marker size (default: 5)
- `circleColor` - Center marker color (default: 'orange')
- `fovColor` - Field of view wedge color (default: 'lightblue')

## Error Handling

The library gracefully handles missing or invalid EXIF data:

```ts
try {
  const info = await getPhotoInfo(file);

  // Properties will be null when data is unavailable
  if (info.gpsPosition) {
    console.log('Photo has GPS coordinates');
  }

  // Core properties like width/height default to 0 if unavailable
  if (info.width === 0) {
    console.log('Could not determine image dimensions');
  }
} catch (error) {
  // File reading errors will throw
  console.error('Failed to read file:', error);
}
```

## Practical Examples

### Display photos on a map

```ts
const photos = await Promise.all(
  files.map(async (file) => ({
    file,
    info: await getPhotoInfo(file),
  })),
);

// Filter photos with GPS data
const geotaggedPhotos = photos.filter((p) => p.info.gpsPosition);

// Add markers to your map
geotaggedPhotos.forEach(({ info }) => {
  const [lat, lng] = info.gpsPosition;

  // Create marker with field-of-view indicator
  const marker = L.marker([lat, lng]);

  if (info.angleOfView && info.bearing) {
    // Add FOV visualization
    const svg = createFovMarkerSvg({
      angleOfView: info.angleOfView,
      bearing: info.bearing,
    });
    // Add SVG overlay to map
  }
});
```

### Extract camera settings

```ts
const info = await getPhotoInfo(file);

if (info.fNumber && info.exposureTime && info.focalLength) {
  console.log(
    `Shot at ${info.fNumber}, ${info.exposureTime}s, ${info.focalLength}mm`,
  );

  if (info.focalLengthIn35mm) {
    console.log(`35mm equivalent: ${info.focalLengthIn35mm}mm`);
  }
}
```

## Browser Compatibility

This library requires:

- Modern browser with File API support
- async/await support (or transpilation)
- Works with JPEG, TIFF, PNG, HEIC, and WebP files containing EXIF data
