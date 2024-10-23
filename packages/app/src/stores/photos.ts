import { atom } from 'nanostores';
import { getPhotoInfo } from 'photo-info';
import { flyTo } from './map';

type PhotoInfo = Awaited<Promise<ReturnType<typeof getPhotoInfo>>>;

export type Photo = {
  file: File;
  id: string;
} & PhotoInfo;

export const photos = atom<Photo[]>([]);
export const selectedPhoto = atom<Photo | null>(null);

export async function addPhoto(file: File) {
  const photoInfo = await getPhotoInfo(file);

  photos.set([
    ...photos.get(),
    {
      file,
      id: file.name,
      ...photoInfo,
    },
  ]);
}

export function selectPhoto(id: string) {
  const photo = photos.get().find((p) => p.id === id);

  if (!photo) return;

  selectedPhoto.set(photo);
}

selectedPhoto.subscribe((photo) => {
  if (photo?.gpsPosition) {
    flyTo(photo.gpsPosition);
  }
});
