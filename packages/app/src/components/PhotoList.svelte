<script lang="ts">
  import {
    gallery,
    removeMarker,
    fitToAllMarkers,
    fitToMarkerByPosition,
    type Photo,
  } from '$runes';
  import IconClose from 'virtual:icons/ic/baseline-close';
  import IconRemove from 'virtual:icons/ic/baseline-remove-circle';
  import IconPhotoGallery from 'virtual:icons/ic/baseline-photo-library';
  import { getMarkerByPhoto } from '$lib/map';
  import { Button } from './ui/button';
  import { Label } from './ui/label';
  import * as RadioGroup from './ui/radio-group';
  import ImagePreview from './ImagePreview.svelte';

  // Constants for UI configuration
  const MAP_EDGE_PADDING = 50;
  const SIDEBAR_WIDTH = 320;

  const getPadding = () => ({
    paddingTopLeft: [MAP_EDGE_PADDING, MAP_EDGE_PADDING] as [number, number],
    paddingBottomRight: [
      gallery.sidebarOpen ? SIDEBAR_WIDTH + MAP_EDGE_PADDING : MAP_EDGE_PADDING,
      MAP_EDGE_PADDING,
    ] as [number, number],
  });

  const fitMarkers = () => fitToAllMarkers(getPadding());

  function handlePhotoClick(photo: Photo) {
    if (!photo.gpsPosition) return;

    fitToMarkerByPosition(photo.gpsPosition, getPadding());
  }

  function handleRemovePhoto(photo: Photo) {
    gallery.removePhoto(photo);

    if (gallery.selectedPhoto?.id === photo.id) {
      gallery.selectPhoto('');
    }

    const marker = getMarkerByPhoto(photo);
    if (marker) {
      removeMarker(marker);
      fitMarkers();
    }
  }

  function handleAddPhotoClick() {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (files.length > 0) {
        await gallery.addPhotos(files);

        // Fit map to show all markers after adding photos
        await fitToAllMarkers(getPadding());
      }
    };

    input.click();
  }

  $effect(() => {
    if (!gallery.selectedPhoto?.gpsPosition) {
      fitMarkers();
    }
  });
</script>

{#if !gallery.sidebarOpen}
  <div class="absolute z-10 right-0 top-0 m-4">
    <Button
      onclick={() => gallery.toggleSidebar(true)}
      class="flex gap-2 bg-muted hover:bg-background text-foreground"
    >
      <IconPhotoGallery /> Photos</Button
    >
  </div>
{/if}

{#if gallery.sidebarOpen}
  <aside
    class="absolute z-10 inset-y-0 right-0 w-80 bg-background/95 backdrop-blur-sm border-l border-border flex flex-col shadow-xl"
  >
    <header class="p-4 border-b border-border flex-shrink-0">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-bold">Photos</h2>
        <Button
          variant="ghost"
          size="icon"
          onclick={() => gallery.toggleSidebar(false)}
        >
          <IconClose />
        </Button>
      </div>
      {#if gallery.photos.length > 0}
        <p class="text-sm text-muted-foreground">
          {gallery.photos.length} photo{gallery.photos.length !== 1 ? 's' : ''} •
          {gallery.geoLocatedPhotos.length} geolocated
        </p>
      {:else}
        <p class="text-sm text-muted-foreground">
          The photos stay in your browser.<br />They are not uploaded anywhere.
        </p>
      {/if}
    </header>

    {#if gallery.photos.length > 0}
      <div class="flex-1 overflow-y-auto p-4">
        <RadioGroup.Root
          value={gallery.selectedPhoto?.id ?? ''}
          class="flex flex-col gap-2"
          onValueChange={gallery.selectPhoto}
        >
          {#each gallery.photos as photo}
            <Label
              for={photo.id}
              class="group relative border-2 border-border hover:border-primary/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 rounded-lg overflow-hidden cursor-pointer transition-all"
            >
              <RadioGroup.Item
                value={photo.id}
                id={photo.id}
                class="sr-only"
                aria-label={photo.file.name}
                onclick={() => handlePhotoClick(photo)}
              />
              <ImagePreview {photo} lockAspectRatio class="h-48" />
              <Button
                variant="destructive"
                size="icon"
                class="opacity-0 group-hover:opacity-100 absolute right-2 top-2 h-8 w-8 transition-opacity duration-200"
                onclick={(e: MouseEvent) => {
                  e.stopPropagation();
                  handleRemovePhoto(photo);
                }}
              >
                <IconRemove class="text-lg" />
              </Button>
            </Label>
          {/each}
        </RadioGroup.Root>
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <IconPhotoGallery
            class="w-16 h-16 mx-auto mb-4 text-muted-foreground"
          />
          <p class="text-muted-foreground mb-2">No photos yet</p>
          <p class="text-sm text-muted-foreground">
            Drag and drop photos onto the map
          </p>
        </div>
      </div>
    {/if}
    <footer class="p-4 border-t border-border flex-shrink-0">
      <Button variant="outline" onclick={handleAddPhotoClick}>Add Photo</Button>
    </footer>
  </aside>
{/if}
