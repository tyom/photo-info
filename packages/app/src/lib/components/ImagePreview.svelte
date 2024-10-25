<script lang="ts">
  import { type Photo } from '$runes';
  import IconGpsOn from 'virtual:icons/ic/baseline-gps-fixed';
  import IconGpsOff from 'virtual:icons/ic/baseline-gps-off';
  import { cn } from '$lib/utils.ts';

  type $Props = {
    photo: Photo;
    resizeRatio?: number;
    quality?: number;
    class?: string;
    lockAspectRatio?: boolean;
  };

  const {
    photo,
    resizeRatio = 0.3,
    quality = 0.7,
    lockAspectRatio = false,
    class: className,
  }: $Props = $props();

  const minWidth = 200;
  const minHeight = 200;

  let image: HTMLImageElement;
  const originalUrl = URL.createObjectURL(photo.file);
  let thumbnailUrl = $state('');

  const getFigureStyle = () =>
    lockAspectRatio ? `aspect-ratio: ${getAspectRatio(photo)}` : '';

  async function resizeImage() {
    // Create an offscreen canvas if supported; otherwise, use a hidden canvas.
    const canvas = document.createElement('canvas');

    canvas.width = Math.max(photo.width * resizeRatio, minWidth);
    canvas.height = Math.max(photo.height * resizeRatio, minHeight);

    // Draw the resized image onto the canvas.
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = URL.createObjectURL(photo.file);

    // Wait for the image to load.
    await img.decode();
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a Blob URL to use as the thumbnail.
    canvas.toBlob(
      (blob) => {
        if (blob) {
          thumbnailUrl = URL.createObjectURL(blob);
        }
      },
      'image/jpeg',
      quality,
    );
  }

  function handleLoad(e: Event) {
    const image = e.target as HTMLImageElement;
    image.classList.add('loaded');
  }

  const getAspectRatio = (photo: Photo) => `${photo.width / photo.height}/1`;

  $effect(() => {
    // FIXME: Find a way to improve the performance when the images are removed and the
    //  gallery list is updated. This is masking it.
    image.classList.remove('loaded');

    if (originalUrl) {
      resizeImage();
    }
  });
</script>

<figure
  class={cn('relative w-full bg-black/20', className)}
  style={getFigureStyle()}
>
  <img
    bind:this={image}
    src={thumbnailUrl}
    alt=""
    width="auto"
    height="auto"
    class="image-preview"
    onload={handleLoad}
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

<style>
  .image-preview {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
  }
  :global(.image-preview.loaded) {
    opacity: 1;
  }
</style>
