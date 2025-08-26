<script lang="ts">
  import IconCheck from 'virtual:icons/ic/baseline-check';
  import IconClose from 'virtual:icons/ic/baseline-close';
  import IconZoomIn from 'virtual:icons/ic/baseline-zoom-in';
  import IconLocation from 'virtual:icons/ic/baseline-location-on';
  import { fitToMarkerByPosition, gallery } from '$runes';
  import { Button } from './ui/button';
  import ImageZoomModal from './ImageZoomModal.svelte';

  let showZoomModal = $state(false);
  let imageUrl = $state('');

  function handleZoomToPhoto() {
    if (!gallery.selectedPhoto?.gpsPosition) return;

    fitToMarkerByPosition(gallery.selectedPhoto.gpsPosition, {
      paddingTopLeft: [50, 50],
      paddingBottomRight: [gallery.sidebarOpen ? 370 : 50, 350],
    });
  }

  function handleImageClick() {
    showZoomModal = true;
  }

  function formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  function getGpsAccuracyClass(grade: string): string {
    const baseClasses =
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium';

    switch (grade) {
      case 'A':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'B':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case 'C':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`;
      default:
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
    }
  }

  $effect(() => {
    // Create URL when photo changes
    if (gallery.selectedPhoto) {
      imageUrl = URL.createObjectURL(gallery.selectedPhoto.file);
    }

    // Cleanup on unmount or when photo changes
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  });
</script>

{#if gallery.selectedPhoto}
  <div
    class="absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border shadow-2xl transition-transform duration-300 ease-out"
    style="transform: translateY({showZoomModal ? 100 : 0}%)"
  >
    <div class="p-4">
      <header class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h2 class="text-xl font-bold mb-1">
            {gallery.selectedPhoto?.file.name}
          </h2>
          <p class="text-sm text-muted-foreground">
            {formatFileSize(gallery.selectedPhoto?.file.size || 0)}
            {#if gallery.selectedPhoto?.dateTime}
              • {new Date(gallery.selectedPhoto?.dateTime).toLocaleString()}
            {/if}
          </p>
        </div>
        <div class="flex gap-2">
          {#if gallery.selectedPhoto?.gpsPosition}
            <Button variant="outline" size="sm" onclick={handleZoomToPhoto}>
              <IconLocation class="mr-2" />
              Zoom to location
            </Button>
          {/if}
          <Button variant="outline" size="sm" onclick={handleImageClick}>
            <IconZoomIn class="mr-2" />
            Zoom image
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onclick={() => gallery.selectPhoto('')}
          >
            <IconClose />
          </Button>
        </div>
      </header>

      <div class="grid grid-cols-[auto_1fr] gap-6">
        <button
          class="group relative cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden w-[200px] h-[150px] bg-black/20"
          onclick={handleImageClick}
        >
          {#if imageUrl}
            <img
              src={imageUrl}
              alt={gallery.selectedPhoto.file.name}
              class="w-full h-full object-cover"
            />
          {/if}
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
          >
            <IconZoomIn
              class="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </button>

        <div
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm"
        >
          {#if gallery.selectedPhoto?.width && gallery.selectedPhoto?.height}
            <div>
              <dt class="text-muted-foreground">Dimensions</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto?.width} × {gallery.selectedPhoto
                  ?.height}px
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.make && gallery.selectedPhoto?.model}
            <div>
              <dt class="text-muted-foreground">Camera</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto?.make}
                {gallery.selectedPhoto?.model}
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.lens}
            <div>
              <dt class="text-muted-foreground">Lens</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto?.lens
                  .replace(gallery.selectedPhoto?.model ?? '', '')
                  .trim()}
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.focalLength}
            <div>
              <dt class="text-muted-foreground">Focal length</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto?.focalLength}mm
                {#if gallery.selectedPhoto?.focalLengthIn35mm}
                  <span class="text-muted-foreground text-xs">
                    ({gallery.selectedPhoto?.focalLengthIn35mm}mm eq.)
                  </span>
                {/if}
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.exposureTime}
            <div>
              <dt class="text-muted-foreground">Exposure</dt>
              <dd class="font-medium">{gallery.selectedPhoto?.exposureTime}</dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.fNumber}
            <div>
              <dt class="text-muted-foreground">Aperture</dt>
              <dd class="font-medium">{gallery.selectedPhoto?.fNumber}</dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.exposureProgram}
            <div>
              <dt class="text-muted-foreground">Program</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto?.exposureProgram}
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.angleOfView}
            <div>
              <dt class="text-muted-foreground">Angle of view</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto
                  ?.angleOfView}°{#if gallery.selectedPhoto?.orientation === 'portrait' && gallery.selectedPhoto?.effectiveAngleOfView}
                  <span class="text-muted-foreground text-sm">
                    ({gallery.selectedPhoto?.effectiveAngleOfView}° in portrait)
                  </span>
                {/if}
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.bearing}
            <div>
              <dt class="text-muted-foreground">Bearing</dt>
              <dd class="font-medium">{gallery.selectedPhoto?.bearing}°</dd>
            </div>
          {/if}

          <div>
            <dt class="text-muted-foreground">GPS Position</dt>
            <dd class="font-medium">
              {#if gallery.selectedPhoto?.gpsPosition}
                {gallery.selectedPhoto?.gpsPosition?.[0].toFixed(6)},
                {gallery.selectedPhoto?.gpsPosition?.[1].toFixed(6)}
                {#if gallery.selectedPhoto?.gpsPosition?.[2]}
                  <span class="text-xs text-muted-foreground">
                    ({gallery.selectedPhoto?.gpsPosition?.[2]}m alt.)
                  </span>
                {/if}
              {:else}
                <span class="text-muted-foreground">No GPS data</span>
              {/if}
            </dd>
          </div>

          {#if gallery.selectedPhoto?.gpsSpeed && gallery.selectedPhoto.gpsSpeed.value > 0}
            <div>
              <dt class="text-muted-foreground">GPS Speed</dt>
              <dd class="font-medium">
                {gallery.selectedPhoto.gpsSpeed.value}
                {gallery.selectedPhoto?.gpsSpeed.unit}
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.gpsAccuracy}
            <div>
              <dt class="text-muted-foreground">GPS Accuracy</dt>
              <dd>
                <span
                  class={getGpsAccuracyClass(
                    gallery.selectedPhoto.gpsAccuracy.grade,
                  )}
                >
                  {gallery.selectedPhoto?.gpsAccuracy.grade}
                </span>
                <span class="text-xs text-muted-foreground ml-1">
                  {gallery.selectedPhoto?.gpsAccuracy.description}
                </span>
              </dd>
            </div>
          {/if}

          {#if gallery.selectedPhoto?.frontCamera}
            <div>
              <dt class="text-muted-foreground">Front camera</dt>
              <dd class="font-medium">
                <IconCheck class="text-green-600 dark:text-green-400" />
              </dd>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if showZoomModal}
    <ImageZoomModal
      photo={gallery.selectedPhoto}
      onClose={() => (showZoomModal = false)}
    />
  {/if}
{/if}
