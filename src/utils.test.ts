import { test, expect, vi } from "vitest";
import * as ExifReader from "exifreader";
import mockExif14mm from "../__mocks__/exif-iphone-14-pro-14mm.json";
import mockExif24mm from "../__mocks__/exif-iphone-14-pro-24mm.json";
import mockExif78mm from "../__mocks__/exif-iphone-14-pro-78mm.json";
import mockExifPortrait from "../__mocks__/exif-iphone-14-pro-portrait.json";
import mockExifSelfie from "../__mocks__/exif-iphone-14-pro-front.json";
import {
  calculate35mmEquivalentFocalLength,
  calculateAngleOfView,
  calculateCropFactor,
  calculateSensorSize,
  getPhotoLocationData,
} from "./utils";

vi.mock("exifreader");

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

test("calculates the angle of view for different focal lengths", () => {
  expect(calculateAngleOfView(2.22, 14)).toEqual(102.0721);
  expect(calculateAngleOfView(6.86, 24)).toEqual(71.5716);
  expect(calculateAngleOfView(8.67, 77)).toEqual(25.3513);
});

test("calculates the 35mm equivalent focal length for different focal lengths", () => {
  expect(calculate35mmEquivalentFocalLength(2.22, 5.6, 4.2)).toEqual(14);
  expect(calculate35mmEquivalentFocalLength(6.86, 9.8, 7.33)).toEqual(24);
  expect(calculate35mmEquivalentFocalLength(9, 4, 3)).toEqual(78);
});

test("calculates the crop factor for different sensor sizes", () => {
  expect(calculateCropFactor(5.6, 4.2)).toEqual(6.18);
  expect(calculateCropFactor(9.8, 7.3)).toEqual(3.54);
  expect(calculateCropFactor(4, 3)).toEqual(8.65);
});

test("calculates sensor size for different focal lengths", () => {
  expect(calculateSensorSize(14, 2.22)).toEqual({ width: 5.49, height: 4.12 });
  expect(calculateSensorSize(24, 6.86)).toEqual({ width: 9.89, height: 7.42 });
  expect(calculateSensorSize(78, 9)).toEqual({ width: 3.99, height: 3 });
});

test("returns location data for 14mm lens", async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif14mm);

  await expect(
    getPhotoLocationData(new File([""], "14mm.jpg")),
  ).resolves.toEqual({
    angleOfView: 102.0721,
    focalLength: 2.22,
    focalLengthIn35mm: 14,
    position: [51.5042361, 0.0465306],
    bearing: 299.93,
    height: 3024,
    width: 4032,
    orientation: "landscape",
    frontCamera: false,
  });
});

test("returns location data for 24mm lens", async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif24mm);

  await expect(
    getPhotoLocationData(new File([""], "24mm.jpg")),
  ).resolves.toEqual({
    angleOfView: 71.5716,
    focalLength: 6.86,
    focalLengthIn35mm: 24,
    position: [51.5042361, 0.0465306],
    bearing: 299.93,
    height: 6048,
    width: 8064,
    orientation: "landscape",
    frontCamera: false,
  });
});

test("returns location data for 77mm lens", async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExif78mm);

  await expect(
    getPhotoLocationData(new File([""], "77mm.jpg")),
  ).resolves.toEqual({
    angleOfView: 24.9969,
    focalLength: 9,
    focalLengthIn35mm: 78,
    position: [51.5042361, 0.0465306],
    bearing: 299.93,
    height: 3024,
    width: 4032,
    orientation: "landscape",
    frontCamera: false,
  });
});

test("returns correct orientation for portrait photo", async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifPortrait);

  await expect(
    getPhotoLocationData(new File([""], "portrait.jpg")),
  ).resolves.toEqual({
    angleOfView: 25.3608,
    focalLength: 9,
    focalLengthIn35mm: 77,
    position: [52.3586194, 4.9417333],
    bearing: 306.03,
    height: 4032,
    width: 3024,
    orientation: "portrait",
    frontCamera: false,
  });
});

test("returns `frontCamera: true` for selfie", async () => {
  // @ts-expect-error partial mock with JSON
  vi.mocked(ExifReader.load).mockResolvedValueOnce(mockExifSelfie);

  await expect(
    getPhotoLocationData(new File([""], "selfie.jpg")),
  ).resolves.toEqual({
    angleOfView: 73.944,
    focalLength: 2.69,
    focalLengthIn35mm: 23,
    position: [52.3712056, 4.8948222],
    bearing: 340.77,
    height: 3024,
    width: 4032,
    orientation: "landscape",
    frontCamera: true,
  });
});
