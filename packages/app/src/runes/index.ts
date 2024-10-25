import { createPhotoGallery } from './photos.svelte';

export { type Photo } from './photos.svelte';

export {
  createMap,
  getMap,
  addMarker,
  getMarkers,
  fitToAllMarkers,
  fitToMarkerByPosition,
} from './map.svelte';

export const gallery = createPhotoGallery();
