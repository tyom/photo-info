<script lang="ts">
  import { divIcon } from 'leaflet';
  import { createFovMarkerSvg, type Position } from 'photo-info';
  import { getMap, addMarker } from '$runes';
  import * as L from 'leaflet';

  type $Props = {
    position: Position;
    angleOfView?: number | null;
    bearing?: number | null;
    size?: number;
  };

  const { position, angleOfView, bearing, size = 300 }: $Props = $props();

  function createIcon({
    angleOfView,
    bearing,
    size = 300,
  }: Omit<$Props, 'position'> = {}) {
    return divIcon({
      className: 'fov-marker',
      html: createFovMarkerSvg({ angleOfView, bearing, viewBoxSize: size }),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  $effect(() => {
    const map = getMap();

    if (map) {
      const icon = createIcon({ angleOfView, bearing, size });
      const marker = L.marker(position, { icon });

      addMarker(marker);
    }
  });
</script>
