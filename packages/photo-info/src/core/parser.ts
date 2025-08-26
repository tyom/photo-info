import * as ExifReader from 'exifreader';
import type { ExifTagName, ExifTag } from './types.ts';

export async function parseExifData(file: File) {
  let tags: ExifReader.Tags;

  try {
    tags = await ExifReader.load(file);
  } catch (error) {
    // If EXIF parsing fails, return minimal data structure
    console.warn(`Failed to parse EXIF data for ${file.name}:`, error);
    tags = {} as ExifReader.Tags;
  }

  function getExifValue<
    K extends keyof ExifTag = keyof ExifTag,
    V = ExifTag[K],
  >(
    tagName: ExifTagName,
    key: K,
    transformer?: (value: ExifTag[K] | number[]) => V,
  ): V | null {
    const tag = tags[tagName];

    if (tag === undefined) {
      return null;
    }

    const value = tag[key];

    if (transformer) {
      return transformer(value);
    }

    return value as V;
  }

  return {
    tags,
    getExifValue,
  };
}
