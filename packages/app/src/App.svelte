<script lang="ts">
  import { type MapOptions } from 'leaflet';
  import { ModeWatcher } from 'mode-watcher';
  import { Map, PhotoMarker, MapStyleSelector } from '$lib/components/map';
  import { PhotoList, SelectedPhoto } from '$lib/components';
  import { gallery } from '$runes';
  import './app.css';

  const mapOptions: MapOptions = {
    center: [51.505, -0.09],
    zoom: 11,
  };
</script>

<main>
  <Map options={mapOptions}>
    {#each gallery.geoLocatedPhotos as { gpsPosition, ...photo }}
      <PhotoMarker position={gpsPosition} {...photo} />
    {/each}
  </Map>
  <PhotoList />
  <SelectedPhoto />
  <MapStyleSelector />
  <ModeWatcher />
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
