import { createPhotoGallery } from '$runes/photos.svelte';

export { type Photo } from '$runes/photos.svelte';
export {
  createMap,
  // renderMarkers,
  getMap,
  flyTo,
  getMarkers,
  getMarkerGroup,
} from '$runes/map.svelte';

export const gallery = createPhotoGallery();
