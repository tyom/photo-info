<script lang="ts">
  import { type Snippet } from 'svelte';
  import { MapOptions, Map as LeafletMap } from 'leaflet';
  import { createMap, gallery, getMarkers } from '$runes';
  import { createIcon, getMarkerByPhoto } from '$lib/map';
  import * as L from 'leaflet';

  type $$Props = {
    children?: Snippet;
    options?: MapOptions;
    layers?: { urlTemplate: string; layerOptions: TileLayerOptions }[];
  };

  let { children, options }: $$Props = $props();

  let map: LeafletMap;

  function mapAction(container: HTMLDivElement) {
    map = createMap(container, options);

    for (const { urlTemplate, layerOptions } of layers) {
      tileLayer(urlTemplate, layerOptions).addTo(map);
    }

    map.on('zoomend', (e) => {
      const markers = getMarkers();
      const zoomLevel = e.target.getZoom();

      console.log(markers.size, zoomLevel);

      // markers.forEach((marker, idx) => {
      //   const { bearing, angleOfView } = gallery.photos[idx];
      //   marker.setIcon(
      //     zoomLevel > 15 ? createIcon({ bearing, angleOfView }) : createIcon(),
      //   );
      // });
    });

    return {
      destroy: () => map.remove(),
    };
  }

  $effect(() => {
    if (!gallery.selectedPhoto) {
      const markers = getMarkers();

      // markers.forEach((marker) => {
      //   if (marker.options.icon?.options) {
      //     marker.setIcon(
      //       L.divIcon({
      //         className: 'fov-marker',
      //         html: marker.options.icon.options.html,
      //       }),
      //     );
      //   }
      // });
    }
  });

  $effect(() => {
    const markers = getMarkers();

    // markers.forEach((marker, idx) => {
    //   const { bearing, angleOfView } = gallery.photos[idx];
    //   marker.setIcon(
    //     createIcon({
    //       bearing,
    //       angleOfView,
    //       size: 300,
    //     }),
    //   );
    // });

    if (gallery.selectedPhoto) {
      const { angleOfView, bearing } = gallery.selectedPhoto;
      const marker = getMarkerByPhoto(gallery.selectedPhoto);

      marker?.setIcon(
        createIcon({
          bearing,
          angleOfView,
          size: 300,
          isActive: true,
        }),
      );
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
