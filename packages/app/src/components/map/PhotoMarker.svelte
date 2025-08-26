<script lang="ts">
  import * as L from 'leaflet';
  import { type Position } from 'photo-info';
  import { getMap, addMarker, gallery } from '$runes';
  import { getPhotoByMarker, createIcon } from '$lib/map';

  type $Props = {
    position: Position;
    angleOfView?: number | null;
    effectiveAngleOfView?: number | null;
    bearing?: number | null;
    size?: number;
    circleOutlineColor?: string;
  };

  const {
    position,
    angleOfView,
    effectiveAngleOfView,
    bearing,
    size = 300,
  }: $Props = $props();

  let marker: L.Marker;
  // Use effectiveAngleOfView if available (considers orientation), otherwise fall back to angleOfView
  let icon = createIcon({
    angleOfView: effectiveAngleOfView ?? angleOfView,
    bearing,
    size,
  });

  $effect(() => {
    const map = getMap();

    if (map) {
      marker = L.marker(position, { icon });

      marker.on('click', (evt) => {
        const activePhoto = getPhotoByMarker(evt.sourceTarget);
        gallery.selectPhoto(activePhoto?.id ?? '');
      });

      addMarker(marker);
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
  :global(.fov-marker [data-active] .circle-outer) {
    fill: #fff4;
  }
  :global(.fov-marker .angle-of-view) {
    opacity: 0;
  }
  :global(.fov-marker .circle-inner) {
    fill: #285eff;
  }
  :global(.fov-marker [data-active] .circle-inner) {
    fill: #ff8800;
  }
  :global(.fov-marker [data-angle-of-view] .angle-of-view) {
    opacity: 1;
  }
</style>
