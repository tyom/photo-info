import { atom } from 'nanostores';
import * as L from 'leaflet';
import { getPhotoLocationData } from 'geo-photo';

export type Photo = {
  file: File;
  angleOfView: number | null;
  bearing: number | null;
  position: null;
};

export type PhotoWithLocation = Omit<Photo, 'position'> & {
  position: L.LatLngTuple;
};

export const photos = atom<(Photo | PhotoWithLocation)[]>([]);

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
