<script lang="ts">
  import { TileLayer, tileLayer } from 'leaflet';
  import { Button } from '$lib/components';
  import { getMap } from '$runes';
  import { tileLayers } from '../../map-styles';

  function handleTileSelection(layerKey: keyof typeof tileLayers) {
    const map = getMap();

    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof TileLayer) {
        map.removeLayer(layer);
      }
    });
    const layer = tileLayers[layerKey];

    tileLayer(layer.urlTemplate, layer.layerOptions).addTo(map);
  }
</script>

<div class="absolute top-3 left-16">
  {#each Object.entries(tileLayers) as [layerKey, layer]}
    <Button onclick={() => handleTileSelection(layerKey)}>{layer.name}</Button>
  {/each}
</div>
