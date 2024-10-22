import { atom } from 'nanostores';
import * as L from 'leaflet';
import { getPhotoInfo } from 'photo-info';

export type Photo = {
  file: File;
  angleOfView: number | null;
  bearing: number | null;
  gpsPosition: null;
};

export type PhotoWithLocation = Omit<Photo, 'gpsPosition'> & {
  gpsPosition: L.LatLngTuple;
};

export const photos = atom<(Photo | PhotoWithLocation)[]>([]);

export async function addPhoto(file: File) {
  const { angleOfView, bearing, gpsPosition } = await getPhotoInfo(file);

  photos.set([
    ...photos.get(),
    {
      file,
      angleOfView,
      bearing,
      gpsPosition,
    },
  ]);
}
