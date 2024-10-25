<script lang="ts">
  import IconCheck from 'virtual:icons/ic/baseline-check';
  import IconClose from 'virtual:icons/ic/baseline-close';
  import { Button, ImagePreview } from '$lib/components';
  import { fitToMarkerByPosition, gallery } from '$runes';

  function handleZoomToPhoto() {
    if (!gallery.selectedPhoto?.gpsPosition) return;

    fitToMarkerByPosition(gallery.selectedPhoto.gpsPosition, {
      paddingTopLeft: [50, 50],
      paddingBottomRight: [50, 50],
    });
  }
</script>

{#if gallery.selectedPhoto}
  <div
    class="absolute z-10 bottom-0 left-0 z-2 p-4 bg-gray-800/80 backdrop-blur rounded-tr-xl flex flex-col gap-4"
  >
    <header class="flex justify-between">
      <h2 class="text-xl font-bold">{gallery.selectedPhoto?.file.name}</h2>
      <Button
        variant="ghost"
        size="icon"
        onclick={() => gallery.selectPhoto('')}
      >
        <IconClose />
      </Button>
    </header>
    <div class="flex gap-4">
      <div class="flex flex-col gap-2">
        <ImagePreview
          photo={gallery.selectedPhoto}
          lockAspectRatio
          class="w-[15vw]"
          resizeRatio={0.1}
        />
        <Button onclick={handleZoomToPhoto}>Zoom to location</Button>
      </div>
      <dl class="text-sm grid grid-cols-[0.6fr_1fr] gap-2">
        <dt>Size</dt>
        <dd>{gallery.selectedPhoto?.file.size.toLocaleString()} bytes</dd>
        {#if gallery.selectedPhoto?.dateTime}
          <dt>Date/time taken</dt>
          <dd>{new Date(gallery.selectedPhoto?.dateTime).toLocaleString()}</dd>
        {/if}
        {#if gallery.selectedPhoto?.make && gallery.selectedPhoto?.model}
          <dt>Camera</dt>
          <dd>{gallery.selectedPhoto?.model}</dd>
        {/if}
        {#if gallery.selectedPhoto?.lens}
          <dt>Lens</dt>
          <dd>
            {gallery.selectedPhoto?.lens
              .replace(gallery.selectedPhoto?.model ?? '', '')
              .trim()}
          </dd>
        {/if}
        {#if gallery.selectedPhoto?.width && gallery.selectedPhoto?.height}
          <dt>Dimensions</dt>
          <dd>
            {gallery.selectedPhoto?.width} x {gallery.selectedPhoto?.height}px
          </dd>
        {/if}
        {#if gallery.selectedPhoto?.orientation}
          <dt>Orientation</dt>
          <dd>{gallery.selectedPhoto?.orientation}</dd>
        {/if}
        {#if gallery.selectedPhoto?.focalLength}
          <dt>Focal length</dt>
          <dd>
            {gallery.selectedPhoto?.focalLength}mm
            {#if gallery.selectedPhoto?.focalLengthIn35mm}
              ({gallery.selectedPhoto?.focalLengthIn35mm}mm equivalent)
            {/if}
          </dd>
        {/if}
        {#if gallery.selectedPhoto?.exposureTime}
          <dt>Exposure time</dt>
          <dd>{gallery.selectedPhoto?.exposureTime}</dd>
        {/if}
        {#if gallery.selectedPhoto?.exposureProgram}
          <dt>Exposure program</dt>
          <dd>{gallery.selectedPhoto?.exposureProgram}</dd>
        {/if}
        {#if gallery.selectedPhoto?.fNumber}
          <dt>F-number</dt>
          <dd>{gallery.selectedPhoto?.fNumber}</dd>
        {/if}
        {#if gallery.selectedPhoto?.angleOfView}
          <dt>Angle of view</dt>
          <dd>{gallery.selectedPhoto?.angleOfView}°</dd>
        {/if}
        {#if gallery.selectedPhoto?.frontCamera}
          <dt>Front camera</dt>
          <dd><IconCheck /></dd>
        {/if}
        <dt>GPS Position</dt>
        <dd>
          {#if gallery.selectedPhoto?.gpsPosition}
            <ul class="list-disc list-inside">
              <li>
                <span class="opacity-50">Latitude:</span>
                {gallery.selectedPhoto?.gpsPosition?.[0]}
              </li>
              <li>
                <span class="opacity-50">Longitude:</span>
                {gallery.selectedPhoto?.gpsPosition?.[1]}
              </li>
              <li>
                <span class="opacity-50">Altitude:</span>
                {gallery.selectedPhoto?.gpsPosition?.[2]}
              </li>
            </ul>
          {:else}
            No GPS data
          {/if}
        </dd>
        {#if gallery.selectedPhoto?.gpsSpeed && gallery.selectedPhoto.gpsSpeed.value > 0}
          <dt>GPS Speed</dt>
          <dd>
            {gallery.selectedPhoto.gpsSpeed.value}
            {gallery.selectedPhoto?.gpsSpeed.unit}
          </dd>
        {/if}
      </dl>
    </div>
  </div>
{/if}

<style>
  dt {
    opacity: 0.7;
    min-width: 130px;
  }
</style>
