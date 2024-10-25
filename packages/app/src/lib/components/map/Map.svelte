<script lang="ts">
  import { type Snippet } from 'svelte';
  import {
    MapOptions,
    Map as LeafletMap,
    tileLayer,
    TileLayerOptions,
  } from 'leaflet';
  import { createMap, gallery, getMarkers } from '$runes';
  import { getMarkerByPhoto, setSvgMarkerState } from '$lib/map';
  import * as L from 'leaflet';

  type $$Props = {
    layer: { urlTemplate: string; layerOptions: TileLayerOptions };
    children?: Snippet;
    options?: MapOptions;
  };

  let { children, options, layer }: $$Props = $props();

  let map: LeafletMap;

  function mapAction(container: HTMLDivElement) {
    map = createMap(container, options);

    tileLayer(layer.urlTemplate, layer.layerOptions).addTo(map);

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
