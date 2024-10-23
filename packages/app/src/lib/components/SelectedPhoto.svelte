<script lang="ts">
  import { selectedPhoto } from '$stores/photos';
  import IconCheck from 'virtual:icons/ic/baseline-check';
</script>

{#if $selectedPhoto}
  <div
    class="absolute z-10 bottom-0 left-0 z-2 p-4 bg-gray-800/80 backdrop-blur rounded-tr-lg flex flex-col gap-4"
  >
    <h2 class="text-xl font-bold">{$selectedPhoto?.file.name}</h2>
    <dl class="text-sm grid grid-cols-[0.6fr_1fr] gap-2">
      <dt>Size</dt>
      <dd>{$selectedPhoto?.file.size.toLocaleString()} bytes</dd>
      {#if $selectedPhoto?.dateTime}
        <dt>Date/time taken</dt>
        <dd>{new Date($selectedPhoto?.dateTime).toLocaleString()}</dd>
      {/if}
      {#if $selectedPhoto?.make && $selectedPhoto?.model}
        <dt>Camera</dt>
        <dd>{$selectedPhoto?.model}</dd>
      {/if}
      {#if $selectedPhoto?.lens}
        <dt>Lens</dt>
        <dd>
          {$selectedPhoto?.lens.replace($selectedPhoto?.model, '').trim()}
        </dd>
      {/if}
      {#if $selectedPhoto?.width && $selectedPhoto?.height}
        <dt>Dimensions</dt>
        <dd>
          {$selectedPhoto?.width} x {$selectedPhoto?.height}px
        </dd>
      {/if}
      {#if $selectedPhoto?.orientation}
        <dt>Orientation</dt>
        <dd>{$selectedPhoto?.orientation}</dd>
      {/if}
      {#if $selectedPhoto?.focalLength}
        <dt>Focal length</dt>
        <dd>
          {$selectedPhoto?.focalLength}mm
          {#if $selectedPhoto?.focalLengthIn35mm}
            ({$selectedPhoto?.focalLengthIn35mm}mm equivalent)
          {/if}
        </dd>
      {/if}
      {#if $selectedPhoto?.exposureTime}
        <dt>Exposure time</dt>
        <dd>{$selectedPhoto?.exposureTime}</dd>
      {/if}
      {#if $selectedPhoto?.exposureProgram}
        <dt>Exposure program</dt>
        <dd>{$selectedPhoto?.exposureProgram}</dd>
      {/if}
      {#if $selectedPhoto?.fNumber}
        <dt>F-number</dt>
        <dd>{$selectedPhoto?.fNumber}</dd>
      {/if}
      {#if $selectedPhoto?.angleOfView}
        <dt>Angle of view</dt>
        <dd>{$selectedPhoto?.angleOfView}°</dd>
      {/if}
      {#if $selectedPhoto?.frontCamera}
        <dt>Front camera</dt>
        <dd><IconCheck /></dd>
      {/if}
      <dt>GPS Position</dt>
      <dd>
        {#if $selectedPhoto?.gpsPosition}
          <ul class="list-disc list-inside">
            <li>
              <span class="opacity-50">Latitude:</span>
              {$selectedPhoto?.gpsPosition?.[0]}
            </li>
            <li>
              <span class="opacity-50">Longitude:</span>
              {$selectedPhoto?.gpsPosition?.[1]}
            </li>
            <li>
              <span class="opacity-50">Altitude:</span>
              {$selectedPhoto?.gpsPosition?.[2]}
            </li>
          </ul>
        {:else}
          No GPS data
        {/if}
      </dd>
      {#if $selectedPhoto?.gpsSpeed && $selectedPhoto.gpsSpeed.value > 0}
        <dt>GPS Speed</dt>
        <dd>
          {$selectedPhoto.gpsSpeed.value}
          {$selectedPhoto?.gpsSpeed.unit}
        </dd>
      {/if}
    </dl>
  </div>
{/if}

<style>
  dt {
    opacity: 0.8;
    min-width: 130px;
  }
</style>
