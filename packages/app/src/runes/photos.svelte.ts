import { getPhotoInfo, type Position } from 'photo-info';

const isDebugging = import.meta.env.MODE === 'development';

const LOCAL_STORAGE_KEY = 'photo-info:sidebarOpen';
const defaultSidebarOpen = localStorage.getItem(LOCAL_STORAGE_KEY ?? 'true');

export type Photo = {
  file: File;
  id: string;
} & Awaited<Promise<ReturnType<typeof getPhotoInfo>>>;

export function createPhotoGallery() {
  let photos = $state<Photo[]>([]);
  let selectedPhoto = $state<Photo | null>(null);
  let sidebarOpen = $state(defaultSidebarOpen === 'true');

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
    get sidebarOpen() {
      return sidebarOpen;
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
    toggleSidebar(value?: boolean) {
      if (typeof value === 'boolean') {
        sidebarOpen = value;
      } else {
        sidebarOpen = !sidebarOpen;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, sidebarOpen.toString());
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
