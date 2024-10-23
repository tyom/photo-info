import { getPhotoInfo } from 'photo-info';

const isDebugging = import.meta.env.MODE === 'development';

export type Photo = {
  file: File;
  id: string;
} & Awaited<Promise<ReturnType<typeof getPhotoInfo>>>;

export function createPhotoGallery() {
  let photos = $state<Photo[]>([]);
  let selectedPhoto = $state<Photo | null>(null);
  let status = $state<'idle' | 'updating' | 'complete'>('idle');

  return {
    get photos() {
      return photos;
    },
    get selectedPhoto() {
      return selectedPhoto;
    },
    get status() {
      return status;
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

      status = 'updating';

      photos = [
        ...photos,
        {
          file,
          id: file.name,
          ...photoInfo,
        },
      ];
    },
    async addPhotos(files: File[]) {
      const acceptedFilesPromises = files.map(this.addPhoto);
      await Promise.all(acceptedFilesPromises);
      status = 'complete';
    },
    selectPhoto(id: string) {
      selectedPhoto = photos.find((p) => p.id === id) ?? null;
    },
  };
}
