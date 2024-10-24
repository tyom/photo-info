import { createPhotoGallery } from '$runes/photos.svelte';

export { type Photo } from '$runes/photos.svelte';
export {
  createMap,
  getMap,
  addMarker,
  getMarkers,
  fitToAllMarkers,
  fitToMarkerByPosition,
} from '$runes/map.svelte';

export const gallery = createPhotoGallery();
