import * as L from 'leaflet';
import { tileLayers } from '$map-styles';

type MapStyle = (typeof tileLayers)[number]['id'];

const LOCAL_STORAGE_KEY = 'photo-info:mapStyle';

// Safe localStorage access with error handling
function getLocalStorageItem(key: string, defaultValue: string): string {
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
    return defaultValue;
  }
}

function setLocalStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
  }
}

const defaultMapStyle = getLocalStorageItem(
  LOCAL_STORAGE_KEY,
  tileLayers[0].id,
) as MapStyle;

let map = $state<L.Map | null>(null);
let mapStyle = $state<MapStyle>(defaultMapStyle);
const markers = $state<Map<string, L.Marker>>(new Map());

type FlyToOptions = {
  duration?: number;
  easeLinearity?: number;
  noMoveStart?: boolean;
  paddingTopLeft?: [number, number];
  paddingBottomRight?: [number, number];
  padding?: [number, number];
};

export function createMap(container: HTMLDivElement, options?: L.MapOptions) {
  if (!options?.center) {
    throw new Error('Map center not provided');
  }
  const m = L.map(container, { preferCanvas: true }).setView(
    options.center,
    options.zoom,
  );

  map = m;

  return m;
}

export function addMarker(marker: L.Marker): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!map) {
      reject(new Error('Map not initialized'));
      return;
    }

    const latLngKey = marker.getLatLng().toString();
    const isExistingMarker = markers.has(latLngKey);

    if (!isExistingMarker) {
      markers.set(latLngKey, marker);
      marker.addTo(map);
      // Resolve once the marker is added
      resolve();
    } else {
      resolve();
    }
  });
}

export function removeMarker(marker: L.Marker) {
  const latLngKey = marker.getLatLng().toString();
  markers.delete(latLngKey);
  marker.remove();
}

export function fitToAllMarkers(options: FlyToOptions): Promise<void> {
  return new Promise((resolve) => {
    if (markers.size === 0) {
      resolve();
      return;
    }
    const markerGroup = L.featureGroup(Array.from(markers.values()));
    map?.flyToBounds(markerGroup.getBounds(), options);

    // Wait for the animation to start
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

export function fitToMarkerByPosition(
  position: L.LatLngTuple,
  options: FlyToOptions,
) {
  const markerKey = L.latLng(position).toString();
  const marker = markers.get(markerKey);
  if (!marker) {
    if (import.meta.env.MODE === 'development') {
      console.warn(`No active markers found for ${markerKey}`);
      console.log(markers.keys());
    }
    return;
  }
  const markerGroup = L.featureGroup([marker]);
  map?.flyToBounds(markerGroup.getBounds(), options);
}

export function setMapStyle(layerId: typeof mapStyle = mapStyle) {
  if (!map) return;

  mapStyle = layerId;
  setLocalStorageItem(LOCAL_STORAGE_KEY, layerId);

  const layer = tileLayers.find((x) => x.id === layerId);

  if (!layer) {
    throw new Error(`Layer with id ${layerId} not found`);
  }

  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map?.removeLayer(layer);
    }
  });

  L.tileLayer(layer.urlTemplate, layer.layerOptions).addTo(map);
}

export const getMap = () => map;
export const getMapStyle = () => mapStyle;
export const getMarkers = () => markers;
