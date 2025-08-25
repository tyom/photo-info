import { getPhotoInfo, type Position } from 'photo-info';

const isDebugging = import.meta.env.MODE === 'development';

const LOCAL_STORAGE_KEY = 'photo-info:sidebarOpen';
const defaultSidebarOpen = localStorage.getItem(LOCAL_STORAGE_KEY ?? 'true');

export type Photo = {
  file: File;
  id: string;
} & Awaited<Promise<ReturnType<typeof getPhotoInfo>>>;

// Generate a unique ID for each photo to avoid collisions
function generatePhotoId(file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const fileInfo = `${file.name}-${file.size}-${file.lastModified}`;
  return `${timestamp}-${random}-${fileInfo}`;
}

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
      try {
        const { originalTags, ...photoInfo } = await getPhotoInfo(
          file,
          isDebugging,
        );

        const photoId = generatePhotoId(file);

        // Check if this exact file was already added (using size and lastModified)
        if (
          photos.find(
            (p) =>
              p.file.size === file.size &&
              p.file.lastModified === file.lastModified &&
              p.file.name === file.name,
          )
        ) {
          console.warn('This exact file has already been added');
          return;
        }

        if (originalTags && isDebugging) {
          console.log(file.name, {
            'EXIF data': originalTags,
            'Extracted data': photoInfo,
          });
        }

        photos = [
          ...photos,
          {
            file,
            id: photoId,
            ...photoInfo,
          },
        ];
      } catch (error) {
        console.error(`Failed to process photo ${file.name}:`, error);
        // Still add the photo with minimal information
        const photoId = generatePhotoId(file);
        photos = [
          ...photos,
          {
            file,
            id: photoId,
            make: null,
            model: null,
            angleOfView: null,
            focalLength: null,
            focalLengthIn35mm: null,
            gpsPosition: null,
            gpsSpeed: null,
            bearing: null,
            width: 0,
            height: 0,
            orientation: 'landscape' as const,
            frontCamera: false,
            dateTime: null,
            exposureTime: null,
            exposureProgram: null,
            fNumber: null,
            lens: null,
          },
        ];
      }
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
