import { createPhotoGallery } from './photos.svelte';

export { type Photo } from './photos.svelte';

export {
  createMap,
  getMap,
  getMapStyle,
  addMarker,
  removeMarker,
  getMarkers,
  fitToAllMarkers,
  fitToMarkerByPosition,
  setMapStyle,
} from './map.svelte';

export const gallery = createPhotoGallery();
