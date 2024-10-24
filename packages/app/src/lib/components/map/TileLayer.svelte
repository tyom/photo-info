<script lang="ts">
  import { type TileLayerOptions, tileLayer } from 'leaflet';
  import { getMap } from '$runes';

  type $Props = {
    url: string;
    options?: TileLayerOptions;
  };

  const { url, options }: $Props = $props();

  $effect(() => {
    const map = getMap();
    if (map) {
      tileLayer(url, options).addTo(map);
    }
  });
</script>
