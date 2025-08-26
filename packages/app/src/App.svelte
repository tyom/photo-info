<script lang="ts">
  import { type MapOptions } from 'leaflet';
  import { ModeWatcher } from 'mode-watcher';
  import { Map, PhotoMarker, MapStyleSelector } from '$components/map';
  import { PhotoList } from '$components';
  import MapDropzone from '$components/MapDropzone.svelte';
  import PhotoDetailsOverlay from '$components/PhotoDetailsOverlay.svelte';
  import { gallery } from '$runes';
  import './app.css';

  const mapOptions: MapOptions = {
    center: [51.505, -0.09],
    zoom: 13,
  };
</script>

<main>
  <MapDropzone />
  <Map options={mapOptions}>
    {#each gallery.geoLocatedPhotos as { gpsPosition, ...photo }}
      <PhotoMarker position={gpsPosition} {...photo} />
    {/each}
  </Map>
  <PhotoList />
  <PhotoDetailsOverlay />
  <MapStyleSelector class="absolute z-10 top-3 left-14" />
  <ModeWatcher />
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
