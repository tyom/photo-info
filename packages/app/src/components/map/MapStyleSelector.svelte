<script lang="ts">
  import { Select } from '$components';
  import { getMapStyle, setMapStyle } from '$runes';
  import { tileLayers } from '$map-styles';

  let { class: className = '' } = $props();

  const mapStyle = getMapStyle();

  let value = $state<string>(mapStyle);
</script>

<div class={className}>
  <Select.Root
    type="single"
    {value}
    onValueChange={(v) => {
      if (v) {
        value = v;
        setMapStyle(v as typeof mapStyle);
      }
    }}
  >
    <Select.Trigger class="w-44 bg-popover/90! border-foreground/30">
      {#if value}
        {tileLayers.find((l) => l.id === value)?.name}
      {:else}
        <span class="text-muted-foreground">Select map style</span>
      {/if}
    </Select.Trigger>
    <Select.Content class="-mt-[2px]">
      {#each tileLayers as layer}
        <Select.Item value={layer.id}>{layer.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
</div>
