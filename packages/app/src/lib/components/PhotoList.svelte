<script lang="ts">
  import Dropzone from 'svelte-file-dropzone';
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
  import { cn } from '$lib/utils';
  import { getMarkerByPhoto } from '$lib/map';
  import { Button } from './ui/button';
  import { Label } from './ui/label';
  import ImagePreview from './ImagePreview.svelte';
  import * as RadioGroup from './ui/radio-group';

  let isSidebarOpen = $state(true);
  let formWidth = $state(0);
  let hasAddedFiles = $state(false);
  let isDraggingOver = $state(false);

  const fitMarkers = () =>
    fitToAllMarkers({
      paddingTopLeft: [50, 50],
      paddingBottomRight: [isSidebarOpen ? formWidth : 0, 50],
    });

  async function handleFileDrop(e: CustomEvent<{ acceptedFiles: File[] }>) {
    const { acceptedFiles } = e.detail;
    await gallery.addPhotos(acceptedFiles);

    isDraggingOver = false;

    // TODO: find a better way to ensure all markers are added
    setTimeout(() => {
      hasAddedFiles = true;
      fitMarkers();
    }, 500);
  }

  function handlePhotoClick(photo: Photo) {
    if (!photo.gpsPosition) return;

    fitToMarkerByPosition(photo.gpsPosition, {
      paddingTopLeft: [50, 50],
      paddingBottomRight: [isSidebarOpen ? formWidth : 0, 50],
    });
  }

  function handleRemovePhoto(photo: Photo) {
    gallery.removePhoto(photo);

    const marker = getMarkerByPhoto(photo);
    if (marker) {
      removeMarker(marker);
      fitMarkers();
    }
  }

  $effect(() => {
    if (!gallery.selectedPhoto?.gpsPosition) {
      fitMarkers();
    }
  });
</script>

{#if !isSidebarOpen}
  <div class="absolute z-10 right-0 top-0 m-4">
    <Button onclick={() => (isSidebarOpen = true)} class="flex gap-2">
      <IconPhotoGallery /> Add Photos</Button
    >
  </div>
{/if}

{#if isSidebarOpen}
  <form
    bind:clientWidth={formWidth}
    class="absolute z-10 inset-0 left-auto w-1/5 min-w-20 max-w-72 bg-gray-800/80 backdrop-blur flex flex-col"
  >
    <header class="p-4 pb-2">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Photos</h2>
        <Button
          variant="ghost"
          size="icon"
          onclick={() => (isSidebarOpen = false)}
        >
          <IconClose />
        </Button>
      </div>
      <p class="text-xs">
        The photos stay in your browser.<br />They are not uploaded anywhere.
      </p>
    </header>
    {#if gallery.photos.length > 0}
      <RadioGroup.Root
        value={gallery.selectedPhoto?.id ?? ''}
        class="flex flex-col flex-2 px-4 py-2 overflow-auto mb-30 border-white/50 border-t border-b"
        onValueChange={gallery.selectPhoto}
      >
        {#each gallery.photos as photo}
          <Label
            for={photo.file.name}
            class="group relative border-muted hover:border-white/30 [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between border-2 bg-transparent shadow cursor-pointer"
          >
            <RadioGroup.Item
              value={photo.file.name}
              id={photo.file.name}
              class="sr-only"
              aria-label="Card"
              on:click={() => handlePhotoClick(photo)}
            />
            <ImagePreview {photo} lockAspectRatio />
            <Button
              variant="ghost"
              size="icon"
              class="opacity-0 group-hover:opacity-100 absolute right-1 top-1 bg-black/30 h-8 w-8 rounded-full hover:text-red-300 transition-opacity duration-200"
              onclick={() => handleRemovePhoto(photo)}
            >
              <IconRemove class="text-lg" />
            </Button>
          </Label>
        {/each}
      </RadioGroup.Root>
    {/if}
    <Dropzone
      on:drop={handleFileDrop}
      on:dragover={() => (isDraggingOver = true)}
      on:dragleave={(isDraggingOver = false)}
      containerClasses={cn(
        'flex-1 m-2 !bg-transparent flex text-center justify-center !border-white/50 !rounded-lg hover:!border-white/75',
        isDraggingOver && '!bg-white/10 !border-white',
      )}
    />
  </form>
{/if}
