<script lang="ts">
  import { TileLayer, tileLayer } from 'leaflet';
  import { Button } from '$lib/components';
  import { getMap } from '$runes';
  import { tileLayers } from '../../layers';

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
  <Button onclick={() => handleTileSelection('satellite')}>Satellite</Button>
  <Button onclick={() => handleTileSelection('osm')}>OpenStreetMap</Button>
  <Button onclick={() => handleTileSelection('carto')}>Carto</Button>
</div>
