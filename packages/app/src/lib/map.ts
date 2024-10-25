import * as L from 'leaflet';
import { createFovMarkerSvg, type Position } from 'photo-info';
import { latLng } from 'leaflet';
import { gallery, getMarkers, type Photo } from '$runes';

const parser = new DOMParser();

type MakerOptions = {
  gpsPosition: Position;
  angleOfView?: number | null;
  bearing?: number | null;
  size?: number;
  isActive?: boolean;
};

export function createIcon({
  angleOfView,
  bearing,
  size = 300,
  isActive = false,
}: Omit<MakerOptions, 'gpsPosition'> = {}) {
  return L.divIcon({
    className: 'fov-marker',
    html: createFovMarkerSvg({
      angleOfView,
      bearing,
      viewBoxSize: size,
      circleOutlineColor: isActive ? '#fff9' : undefined,
    }),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function setSvgMarkerState(
  marker: L.Marker,
  state: Record<string, string | null> = {},
) {
  const markerIcon = marker.getIcon() as L.DivIcon;
  const iconHtml = markerIcon.options.html as string;

  if (!iconHtml) {
    throw new Error('Icon HTML not found');
  }

  const svg = parser.parseFromString(iconHtml, 'image/svg+xml').documentElement;

  Object.entries(state).forEach(([key, value]) => {
    if (value === null) {
      svg.removeAttribute(`data-${key}`);
    } else {
      svg.setAttribute(`data-${key}`, value);
    }
  });

  marker.setIcon(
    L.divIcon({
      ...markerIcon.options,
      html: svg.outerHTML,
    }),
  );
}

export function createMarker({
  gpsPosition,
  bearing,
  size = 300,
}: MakerOptions) {
  const icon = createIcon({ bearing, size });
  return L.marker(gpsPosition, { icon });
}

export function getMarkerByPhoto(photo: Photo) {
  const markers = getMarkers();
  if (photo?.gpsPosition) {
    const markerKey = latLng(photo.gpsPosition).toString();
    const marker = markers.get(markerKey);

    if (marker) {
      return marker;
    }
  }
  return null;
}

export function getPhotoByMarker(marker: L.Marker) {
  const { lat, lng, alt } = marker.getLatLng();
  const position = [lat, lng, alt];

  return (
    gallery.photos.find(
      (p) =>
        p.gpsPosition?.[0] === position[0] &&
        p.gpsPosition?.[1] === position[1],
    ) ?? null
  );
}
