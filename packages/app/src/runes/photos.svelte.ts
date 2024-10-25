import { getPhotoInfo, type Position } from 'photo-info';

const isDebugging = import.meta.env.MODE === 'development';

export type Photo = {
  file: File;
  id: string;
} & Awaited<Promise<ReturnType<typeof getPhotoInfo>>>;

export function createPhotoGallery() {
  let photos = $state<Photo[]>([]);
  let selectedPhoto = $state<Photo | null>(null);

  const geoLocatedPhotos = $derived(
    photos.filter((p): p is Photo & { gpsPosition: Position } =>
      Boolean(p.gpsPosition),
    ),
  );

  return {
    get photos() {
      return photos;
    },
    get geoLocatedPhotos() {
      return geoLocatedPhotos;
    },
    get selectedPhoto() {
      return selectedPhoto;
    },

    async addPhoto(file: File) {
      const { originalTags, ...photoInfo } = await getPhotoInfo(
        file,
        isDebugging,
      );

      if (photos.find((p) => p.id === file.name)) {
        console.warn('photo with the same name already exists');
        return;
      }

      if (originalTags) {
        console.log(file.name, {
          'EXIF data': originalTags,
          'Extracted data': photoInfo,
        });
      }

      photos = [
        ...photos,
        {
          file,
          id: file.name,
          ...photoInfo,
        },
      ];
    },
    removePhoto(photo: Photo) {
      photos = photos.filter((p) => p.id !== photo.id);
    },
    async addPhotos(files: File[]) {
      const acceptedFilesPromises = files.map(this.addPhoto);
      await Promise.all(acceptedFilesPromises);
    },
    selectPhoto(id: string) {
      selectedPhoto = photos.find((p) => p.id === id) ?? null;
    },
  };
}
