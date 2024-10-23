import * as L from 'leaflet';
import { type Position } from 'photo-info';
import { gallery, type Photo } from '$runes';
import { createMarker } from '$lib/map';
import { tileLayers } from '../../layers';
import { initialView, initialZoom } from '../constants';

let map = $state<L.Map | null>(null);

const photoMarkers = $derived(
  gallery.photos
    .filter((p): p is Photo & { gpsPosition: Position } =>
      Boolean(p.gpsPosition),
    )
    .map(createMarker),
);

const photoMarkerGroup = $derived(L.featureGroup(photoMarkers));

/**
 *
 * @param location
 * @param [zoom = 18]
 * @param [options]
 * @param [options.duration = 2.4] - Animation duration in seconds
 * @param [options.easeLinearity=0.3] - Event trigger for movestart event; default is false
 * @param [options.noMoveStart = false] - Control the rate of animation; lower means slower acceleration
 */
export function flyTo(
  location: L.LatLngTuple | L.LatLngBounds,
  zoom = 18,
  options = { duration: 2.5, easeLinearity: 0.3, noMoveStart: false },
) {
  if (!location) {
    throw new Error('Location not provided');
  }
  // Tuple, assuming it's a single location
  if (Array.isArray(location)) {
    map?.flyTo(location, zoom, options);
    // Assuming bounds
  } else {
    map?.flyToBounds(location, options);
  }
}

export function createMap(container: HTMLDivElement) {
  const m = L.map(container, { preferCanvas: true }).setView(
    initialView,
    initialZoom,
  );

  map = m;

  tileLayers.forEach(({ urlTemplate, layerOptions }) =>
    L.tileLayer(urlTemplate, layerOptions).addTo(m),
  );

  return m;
}

export const getMap = () => map;
export const getMarkers = () => photoMarkers;
export const getMarkerGroup = () => photoMarkerGroup;
