<script lang="ts">
  import {
    gallery,
    createMap,
    flyTo,
    getMarkers,
    getMarkerGroup,
  } from '$runes';
  import { createIcon } from '$lib/map';

  let map: L.Map;
  const visibleMarkers = new Map(); // Using a Map to track markers by position

  function mapAction(container: HTMLDivElement) {
    map = createMap(container);

    map.on('zoomend', (e) => {
      const markers = getMarkers();
      const zoomLevel = e.target.getZoom();

      markers.forEach((marker, idx) => {
        const { bearing, angleOfView } = gallery.photos[idx];
        console.log('creating icon', idx);
        marker.setIcon(
          zoomLevel > 15 ? createIcon({ bearing, angleOfView }) : createIcon(),
        );
      });
    });

    return {
      destroy: () => map.remove(),
    };
  }

  function renderMarkers() {
    const availableMarkers = getMarkers();

    visibleMarkers.forEach((marker, key) => {
      const exists = availableMarkers.some((m) =>
        m.getLatLng().equals(marker.getLatLng()),
      );
      if (!exists) {
        map.removeLayer(marker);
        visibleMarkers.delete(key);
      }
    });

    availableMarkers.forEach((marker) => {
      const latLngKey = marker.getLatLng().toString();
      if (!visibleMarkers.has(latLngKey)) {
        marker.addTo(map); // Add the marker to the map
        visibleMarkers.set(latLngKey, marker); // Track the marker
      }
    });

    return getMarkerGroup();
  }

  $effect(() => {
    const markerGroup = renderMarkers();

    if (markerGroup.getLayers().length > 0 && gallery.status === 'complete') {
      flyTo(markerGroup.getBounds());
    }
  });

  $effect(() => {
    if (gallery.selectedPhoto?.gpsPosition) {
      flyTo(gallery.selectedPhoto.gpsPosition);
    }
  });
</script>

<div class="map" use:mapAction></div>

<style>
  .map {
    height: 100vh;
    z-index: 0;
  }
</style>
