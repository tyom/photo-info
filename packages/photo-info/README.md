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

```ts
import { getPhotoLocationData } from 'photo-info';

const { angleOfView, bearing, position, make, model } =
  await getPhotoLocationData(file);
```

The `getPhotoLocationData` function returns an object with the following properties:

- `angleOfView`: the angle of view of the photo in degrees
- `bearing`: the bearing of the photo in degrees
- `position`: the position of the photo as a [Leaflet LatLng](https://leafletjs.com/reference-1.9.4.html#latlng) tuple
- `make`: the camera make
- `model`: the camera model
- `focalLength`: the focal length of the camera in millimeters
- `focalLengthIn35mm`: the focal length of the camera in 35mm equivalent millimeters
- `width`: the width of the photo in pixels
- `height`: the height of the photo in pixels
- `orientation`: the orientation of the photo (`portrait`, `landscape`, or `square`)
- `frontCamera`: whether the photo was taken with the front camera
