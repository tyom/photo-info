import { atom } from "nanostores";
import * as L from "leaflet";
import { getPhotoLocationData } from "../../src";

export type Photo = {
  file: File;
  angleOfView: number | null;
  bearing: number | null;
  position: L.LatLngTuple;
};

export const photos = atom<Photo[]>([]);

export async function addPhoto(file: File) {
  const { angleOfView, bearing, position } = await getPhotoLocationData(file);

  photos.set([
    ...photos.get(),
    {
      file,
      angleOfView,
      bearing,
      position,
    },
  ]);
}
