<script lang="ts">
  import { type Snippet } from 'svelte';
  import * as L from 'leaflet';
  import { createMap, gallery, getMarkers, setMapStyle } from '$runes';
  import { getMarkerByPhoto, setSvgMarkerState } from '$lib/map';

  type $$Props = {
    layer: { urlTemplate: string; layerOptions: L.TileLayerOptions };
    children?: Snippet;
    options?: L.MapOptions;
  };

  let { children, options }: $$Props = $props();

  let map: L.Map;

  function mapAction(container: HTMLDivElement) {
    map = createMap(container, options);

    setMapStyle();

    map.on('zoomend', (e) => {
      const markers = getMarkers();
      const zoomLevel = e.target.getZoom();

      markers.forEach((marker) => {
        setSvgMarkerState(marker, {
          'angle-of-view': zoomLevel > 15 ? '' : null,
        });
      });
    });

    return {
      destroy: () => map.remove(),
    };
  }

  // Handle marker icons
  $effect(() => {
    map.eachLayer((layer) => {
      // Deactivate all markers
      if (layer instanceof L.Marker) {
        setSvgMarkerState(layer, { active: null });
      }
    });

    if (gallery.selectedPhoto) {
      const marker = getMarkerByPhoto(gallery.selectedPhoto);
      // Activate the selected marker
      if (marker) {
        setSvgMarkerState(marker, { active: '' });
      }
    } else {
    }
  });
</script>

<div class="map" use:mapAction>
  {@render children?.()}
</div>

<style>
  .map {
    height: 100vh;
    z-index: 0;
  }
</style>
