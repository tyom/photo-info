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

const isDebugging = import.meta.env.MODE === 'development';

export async function addPhoto(file: File) {
  const { originalTags, ...photoInfo } = await getPhotoInfo(file, isDebugging);

  if (photos.get().find((p) => p.id === file.name)) {
    console.warn('photo with the same name already exists');
    return;
  }

  if (originalTags) {
    console.log(file.name, {
      'EXIF data': originalTags,
      'Extracted data': photoInfo,
    });
  }

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
