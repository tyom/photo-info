<script lang="ts">
  import { Select } from '$components';
  import { getMapStyle, setMapStyle } from '$runes';
  import { tileLayers } from '$map-styles';

  let { class: className = '' } = $props();

  const mapStyle = getMapStyle();

  // For some reason selected requires the value to be an object
  // https://github.com/huntabyte/shadcn-svelte/issues/1132
  const { id, name } = tileLayers.find((x) => x.id === mapStyle) ?? {};
  let selected = $state({ value: id, label: name });
</script>

<div class={className}>
  <Select.Root
    bind:selected
    onSelectedChange={(e) => e && setMapStyle(e.value)}
  >
    <Select.Trigger class="w-44 bg-muted text-foreground">
      <Select.Value placeholder="Select map style" />
    </Select.Trigger>
    <Select.Content class="-mt-[2px]">
      {#each tileLayers as layer}
        <Select.Item value={layer.id}>{layer.name}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
</div>
