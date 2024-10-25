<script lang="ts">
  import { Button } from '$lib/components';
  import { getMapStyle, setMapStyle } from '$runes';
  import { tileLayers } from '$map-styles';
</script>

<div class="absolute top-3 left-16 flex gap-1">
  {#each tileLayers as layer}
    <Button
      onclick={() => setMapStyle(layer.id)}
      variant={layer.id === getMapStyle() ? 'outline' : 'default'}
      >{layer.name}</Button
    >
  {/each}
</div>
