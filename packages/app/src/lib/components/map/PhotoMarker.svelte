<script lang="ts">
  import * as L from 'leaflet';
  import { type Position } from 'photo-info';
  import { getMap, addMarker, gallery } from '$runes';
  import { getPhotoByMarker, createIcon } from '$lib/map';

  type $Props = {
    position: Position;
    angleOfView?: number | null;
    bearing?: number | null;
    size?: number;
    circleOutlineColor?: string;
  };

  const { position, angleOfView, bearing, size = 300 }: $Props = $props();

  let marker: L.Marker;
  let normalIcon = createIcon({ angleOfView, bearing, size, isActive: false });
  let activeIcon = createIcon({ angleOfView, bearing, size, isActive: true });

  $effect(() => {
    const map = getMap();

    if (map) {
      marker = L.marker(position, { icon: normalIcon });

      marker.on('click', (evt) => {
        const activePhoto = getPhotoByMarker(evt.sourceTarget);
        gallery.selectPhoto(activePhoto?.id ?? '');

        marker.setIcon(activeIcon);
      });

      addMarker(marker);
    }
  });

  $effect(() => {
    if (!gallery.selectedPhoto) {
      console.log('resetting icon');
      // FIXME: Only resets the last icon :(
      marker?.setIcon(normalIcon);
    }
  });
</script>

<style>
  :global(.leaflet-marker-icon.fov-marker) {
    cursor: inherit;
    pointer-events: none;
  }
  :global(.leaflet-marker-icon.fov-marker .circle-outer) {
    cursor: pointer;
    pointer-events: auto;
  }
</style>
