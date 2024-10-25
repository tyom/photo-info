import * as L from 'leaflet';
import { tileLayers } from '$map-styles';

type MapStyle = (typeof tileLayers)[number]['id'];

const LOCAL_STORAGE_KEY = 'photo-info:mapStyle';
const defaultMapStyle =
  (localStorage.getItem(LOCAL_STORAGE_KEY) as MapStyle) ?? tileLayers[0].id;

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

export function addMarker(marker: L.Marker) {
  if (!map) {
    throw new Error('Map not initialized');
  }

  const latLngKey = marker.getLatLng().toString();
  const isExistingMarker = markers.has(latLngKey);

  if (!isExistingMarker) {
    markers.set(latLngKey, marker);
    marker.addTo(map);
  }
}

export function removeMarker(marker: L.Marker) {
  const latLngKey = marker.getLatLng().toString();
  markers.delete(latLngKey);
  marker.remove();
}

export function fitToAllMarkers(options: FlyToOptions) {
  if (markers.size === 0) {
    return;
  }
  const markerGroup = L.featureGroup(Array.from(markers.values()));
  map?.flyToBounds(markerGroup.getBounds(), options);
}

export function fitToMarkerByPosition(
  position: L.LatLngTuple,
  options: FlyToOptions,
) {
  const markerKey = L.latLng(position).toString();
  const marker = markers.get(markerKey);
  if (!marker) {
    console.warn(`No active markers found for ${markerKey}`);
    console.log(markers.keys());
    return;
  }
  const markerGroup = L.featureGroup([marker]);
  map?.flyToBounds(markerGroup.getBounds(), options);
}

export function setMapStyle(layerId: typeof mapStyle = mapStyle) {
  if (!map) return;

  mapStyle = layerId;
  localStorage.setItem(LOCAL_STORAGE_KEY, layerId);

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
