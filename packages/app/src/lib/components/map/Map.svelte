<script lang="ts">
  import { type Snippet } from 'svelte';
  import { MapOptions, Map as LeafletMap } from 'leaflet';
  import { createMap, getMarkers } from '$runes';

  type $$Props = {
    children?: Snippet;
    options?: MapOptions;
  };

  let { children, options }: $$Props = $props();

  let map: LeafletMap;

  function mapAction(container: HTMLDivElement) {
    map = createMap(container, options);

    // map.on('zoomend', (e) => {
    //   const markers = getMarkers();
    //   const zoomLevel = e.target.getZoom();
    //
    //   markers.forEach((marker, idx) => {
    //     const { bearing, angleOfView } = gallery.photos[idx];
    //     marker.setIcon(
    //       zoomLevel > 15 ? createIcon({ bearing, angleOfView }) : createIcon(),
    //     );
    //   });
    // });

    return {
      destroy: () => map.remove(),
    };
  }
</script>

<div class="map" use:mapAction>
  {@render children?.()}
</div>

<style>
  .map {
    height: 100%;
    width: 100%;
    z-index: 0;
  }
</style>
