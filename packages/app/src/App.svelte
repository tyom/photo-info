<script lang="ts">
  import { type MapOptions } from 'leaflet';
  import { ModeWatcher } from 'mode-watcher';
  import { PhotoList, SelectedPhoto } from '$lib/components';
  import { Map, TileLayer, PhotoMarker } from '$lib/components/map';
  import { gallery } from '$runes';
  import { tileLayers } from '../layers';
  import './app.css';

  const mapOptions: MapOptions = {
    center: [51.505, -0.09],
    zoom: 11,
  };
</script>

<main>
  <Map options={mapOptions}>
    {#each tileLayers as { urlTemplate, layerOptions }}
      <TileLayer url={urlTemplate} options={layerOptions} />
    {/each}
    {#each gallery.geoLocatedPhotos as { gpsPosition, ...photo }}
      <PhotoMarker position={gpsPosition} {...photo} />
    {/each}
  </Map>
  <PhotoList />
  <SelectedPhoto />
  <ModeWatcher />
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
