import { atom, computed } from 'nanostores';
import * as L from 'leaflet';
import debounce from 'debounce';
import {
  createFovMarkerSvg,
  createSimpleMarkerSvg,
  type Position,
} from 'photo-info';
import { tileLayers } from '../../layers';
import { Photo, photos } from './photos';

const initialView = [51.505, -0.09] as L.LatLngTuple;
const initialZoom = 14;

export const map = atom<L.Map | null>(null);
export const markers = computed(photos, (photos) =>
  photos
    .filter((p): p is Photo & { gpsPosition: Position } =>
      Boolean(p.gpsPosition),
    )
    .map(createMarker),
);

export function createMap(container: HTMLDivElement) {
  const m = L.map(container, { preferCanvas: true }).setView(
    initialView,
    initialZoom,
  );

  map.set(m);

  tileLayers.forEach(({ urlTemplate, layerOptions }) =>
    L.tileLayer(urlTemplate, layerOptions).addTo(m),
  );

  return m;
}

type MakerOptions = {
  gpsPosition: Position;
  angleOfView?: number | null;
  bearing?: number | null;
  size?: number;
};

export function createMarker({
  gpsPosition,
  angleOfView,
  bearing,
  size = 300,
}: MakerOptions) {
  const icon = L.divIcon({
    className: 'fov-marker',
    html:
      angleOfView && bearing
        ? createFovMarkerSvg(angleOfView, bearing, size)
        : createSimpleMarkerSvg(size / 10),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  return L.marker(gpsPosition, { icon });
}

export function flyTo(location: L.LatLngTuple) {
  map.get()?.flyTo(location, 18, {
    duration: 2.5, // Animation duration in seconds
    easeLinearity: 0.3, // Control the rate of animation; lower means slower acceleration
    // noMoveStart: false, // Event trigger for movestart event; default is false
  });
}

const debouncedMarkerUpdate = debounce((value: readonly L.Marker[]) => {
  if (value.length === 0) return;

  const markerGroup = L.featureGroup([...value]);
  markerGroup.addTo(map.get()!);
  map.get()?.flyToBounds(markerGroup.getBounds(), {
    duration: 2.5, // Animation duration in seconds
    easeLinearity: 0.3, // Control the rate of animation; lower means slower acceleration
    // noMoveStart: false, // Event trigger for movestart event; default is false
  });
}, 500);

markers.subscribe(debouncedMarkerUpdate);
