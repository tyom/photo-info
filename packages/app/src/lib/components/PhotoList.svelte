<script lang="ts">
  import Dropzone from 'svelte-file-dropzone';
  import { gallery } from '$runes';
  import { Button } from './ui/button';
  import { Label } from './ui/label';
  import * as RadioGroup from './ui/radio-group';
  import IconGpsOn from 'virtual:icons/ic/baseline-gps-fixed';
  import IconGpsOff from 'virtual:icons/ic/baseline-gps-off';
  import IconClose from 'virtual:icons/ic/baseline-close';
  import IconPhotoGallery from 'virtual:icons/ic/baseline-photo-library';

  let isSidebarOpen = $state(false);

  async function handleFileDrop(e: CustomEvent<{ acceptedFiles: File[] }>) {
    const { acceptedFiles } = e.detail;
    await gallery.addPhotos(acceptedFiles);
  }
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
    class="absolute z-10 inset-0 left-auto w-1/5 min-w-20 max-w-72 bg-gray-800/80 backdrop-blur flex flex-col"
  >
    <header class="flex justify-between items-center p-4">
      <h2 class="text-xl font-bold">Photos</h2>
      <Button
        variant="ghost"
        size="icon"
        onclick={() => (isSidebarOpen = false)}
      >
        <IconClose />
      </Button>
    </header>
    {#if gallery.photos.length > 0}
      <RadioGroup.Root
        value={gallery.selectedPhoto?.id ?? ''}
        class="flex flex-col flex-2 p-4 pt-0 border-red-400 overflow-auto mb-30"
        onValueChange={gallery.selectPhoto}
      >
        {#each gallery.photos as photo}
          <Label
            for={photo.file.name}
            class="border-muted hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 bg-transparent"
          >
            <RadioGroup.Item
              value={photo.file.name}
              id={photo.file.name}
              class="sr-only"
              aria-label="Card"
            />
            <figure class="relative min-h-10 w-full">
              <img
                src={URL.createObjectURL(photo.file)}
                alt=""
                class="image-preview"
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
      containerClasses="flex-1 !bg-transparent flex text-center justify-center"
    />
  </form>
{/if}
