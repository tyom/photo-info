<script lang="ts">
  import Dropzone from 'svelte-file-dropzone';
  import {
    gallery,
    fitToAllMarkers,
    fitToMarkerByPosition,
    type Photo,
  } from '$runes';
  import { Button } from './ui/button';
  import { Label } from './ui/label';
  import * as RadioGroup from './ui/radio-group';
  import IconGpsOn from 'virtual:icons/ic/baseline-gps-fixed';
  import IconGpsOff from 'virtual:icons/ic/baseline-gps-off';
  import IconClose from 'virtual:icons/ic/baseline-close';
  import IconPhotoGallery from 'virtual:icons/ic/baseline-photo-library';
  import { cn } from '$lib/utils';

  let isSidebarOpen = $state(true);
  let formWidth = $state(0);
  let hasAddedFiles = $state(false);
  let isDraggingOver = $state(false);

  const fitMarkers = () =>
    fitToAllMarkers({
      paddingTopLeft: [50, 50],
      paddingBottomRight: [formWidth, 50],
    });

  async function handleFileDrop(e: CustomEvent<{ acceptedFiles: File[] }>) {
    const { acceptedFiles } = e.detail;
    await gallery.addPhotos(acceptedFiles);

    isDraggingOver = false;

    // TODO: find a better way to ensure all markers are added
    setTimeout(() => {
      hasAddedFiles = true;
      fitMarkers();
    }, 800);
  }

  $effect(() => {
    if (gallery.selectedPhoto?.gpsPosition) {
      fitToMarkerByPosition(gallery.selectedPhoto.gpsPosition, {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [formWidth, 50],
      });
    } else if (hasAddedFiles) {
      fitMarkers();
    }
  });

  const getAspectRatio = (photo: Photo) => `${photo.width / photo.height}/1`;
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
            class="border-muted hover:border-white/30 [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between border-2 bg-transparent shadow cursor-pointer"
          >
            <RadioGroup.Item
              value={photo.file.name}
              id={photo.file.name}
              class="sr-only"
              aria-label="Card"
            />
            <figure
              class="relative w-full"
              style="aspect-ratio: {getAspectRatio(photo)}"
            >
              <img
                src={URL.createObjectURL(photo.file)}
                alt=""
                width="auto"
                height="auto"
                class="image-preview"
                onload={(evt) => {
                  evt.target.classList.add('loaded');
                }}
              />
              <figcaption
                class="flex gap-2 items-center absolute inset-0 top-auto z-2 bg-black/50 p-2 text-xs"
              >
                <span class="icons">
                  {#if photo.gpsPosition}
                    <span title="Geolocated photo">
                      <IconGpsOn class="text-green-500" />
                    </span>
                  {:else}
                    <span title="Non-geolocated photo">
                      <IconGpsOff class="text-red-500" />
                    </span>
                  {/if}
                </span>
                <span class="text-center">{photo.file.name}</span>
              </figcaption>
            </figure>
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

<style>
  .image-preview {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
  }
  :global(.image-preview.loaded) {
    opacity: 1;
  }
</style>
