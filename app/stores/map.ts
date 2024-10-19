import { atom, computed } from "nanostores";
import * as L from "leaflet";
import { createFovMarkerSvg } from "../../src";
import { tileLayers } from "../layers";
import { debounce } from "../utils";
import { photos } from "./photos";

const initialView = [51.505, -0.09] as L.LatLngTuple;
const initialZoom = 14;

export const map = atom<L.Map | null>(null);
export const markers = computed(photos, (photos) => photos.map(createMarker));

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
  position: L.LatLngTuple;
  angleOfView?: number | null;
  bearing?: number | null;
  size?: number;
};

export function createMarker({
  position,
  angleOfView,
  bearing,
  size = 300,
}: MakerOptions) {
  if (!angleOfView || !bearing) {
    throw new Error("Angle of view and bearing are required");
  }

  const icon = L.divIcon({
    className: "fov-marker",
    html: createFovMarkerSvg(angleOfView, bearing, size),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  return L.marker(position, { icon });
}

export function flyTo(location: L.LatLngTuple) {
  map.get()?.flyTo(location, 18, {
    duration: 2.5, // Animation duration in seconds
    easeLinearity: 0.3, // Control the rate of animation; lower means slower acceleration
    // noMoveStart: false, // Event trigger for movestart event; default is false
  });
}

const debouncedMarkerUpdate = debounce((value: L.Marker[]) => {
  if (value.length === 0) return;

  const markerGroup = L.featureGroup(value);
  markerGroup.addTo(map.get()!);
  map.get()?.flyToBounds(markerGroup.getBounds(), {
    duration: 2.5, // Animation duration in seconds
    easeLinearity: 0.3, // Control the rate of animation; lower means slower acceleration
    // noMoveStart: false, // Event trigger for movestart event; default is false
  });
}, 500);

markers.subscribe(debouncedMarkerUpdate);
