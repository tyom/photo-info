import * as L from 'leaflet';
import { createFovMarkerSvg, type Position } from 'photo-info';

type MakerOptions = {
  gpsPosition: Position;
  angleOfView?: number | null;
  bearing?: number | null;
  size?: number;
};

export function createIcon({
  angleOfView,
  bearing,
  size = 300,
}: Omit<MakerOptions, 'gpsPosition'> = {}) {
  return L.divIcon({
    className: 'fov-marker',
    html: createFovMarkerSvg({ angleOfView, bearing, viewBoxSize: size }),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function createMarker({
  gpsPosition,
  bearing,
  size = 300,
}: MakerOptions) {
  const icon = createIcon({ bearing, size });
  return L.marker(gpsPosition, { icon });
}
