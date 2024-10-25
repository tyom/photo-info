import { createPhotoGallery } from './photos.svelte';

export { type Photo } from './photos.svelte';

export {
  createMap,
  getMap,
  addMarker,
  removeMarker,
  getMarkers,
  fitToAllMarkers,
  fitToMarkerByPosition,
} from './map.svelte';

export const gallery = createPhotoGallery();
