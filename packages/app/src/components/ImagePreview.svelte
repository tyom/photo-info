<script lang="ts">
  import { type Photo } from '$runes';
  import IconGpsOn from 'virtual:icons/ic/baseline-gps-fixed';
  import IconGpsOff from 'virtual:icons/ic/baseline-gps-off';
  import IconImage from 'virtual:icons/ic/baseline-image';
  import { cn } from '$lib/utils';

  // Constants for image preview configuration
  const DEFAULT_RESIZE_RATIO = 0.3;
  const DEFAULT_JPEG_QUALITY = 0.7;
  const MIN_THUMBNAIL_WIDTH = 200;
  const MIN_THUMBNAIL_HEIGHT = 200;

  type $Props = {
    photo: Photo;
    resizeRatio?: number;
    quality?: number;
    class?: string;
    lockAspectRatio?: boolean;
  };

  const {
    photo,
    resizeRatio = DEFAULT_RESIZE_RATIO,
    quality = DEFAULT_JPEG_QUALITY,
    lockAspectRatio = false,
    class: className,
  }: $Props = $props();

  let image = $state<HTMLImageElement>();
  const originalUrl = URL.createObjectURL(photo.file);
  let thumbnailUrl = $state('');
  let tempImageUrl: string | null = null;
  let thumbnailError = $state(false);
  let isUnsupportedFormat = $state(false);

  const getFigureStyle = () =>
    lockAspectRatio ? `aspect-ratio: ${getAspectRatio(photo)}` : '';

  // Helper to check if the file is HEIC/HEIF format
  function isHeicFormat(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'heic' || ext === 'heif';
  }

  async function resizeImage() {
    try {
      // Create an offscreen canvas if supported; otherwise, use a hidden canvas.
      const canvas = document.createElement('canvas');

      canvas.width = Math.max(photo.width * resizeRatio, MIN_THUMBNAIL_WIDTH);
      canvas.height = Math.max(
        photo.height * resizeRatio,
        MIN_THUMBNAIL_HEIGHT,
      );

      // Draw the resized image onto the canvas.
      const ctx = canvas.getContext('2d');
      const img = new Image();
      tempImageUrl = URL.createObjectURL(photo.file);
      img.src = tempImageUrl;

      // Wait for the image to load and decode.
      try {
        await img.decode();
      } catch (decodeError) {
        // If decode fails, try traditional loading approach
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Clean up temp image URL
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        tempImageUrl = null;
      }

      // Convert the canvas to a Blob URL to use as the thumbnail.
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Revoke previous thumbnail URL if it exists
            if (thumbnailUrl) {
              URL.revokeObjectURL(thumbnailUrl);
            }
            thumbnailUrl = URL.createObjectURL(blob);
          }
        },
        'image/jpeg',
        quality,
      );
    } catch (error) {
      // Check if it's an unsupported format like HEIC
      if (isHeicFormat(photo.file.name)) {
        console.info(
          `HEIC/HEIF format detected for ${photo.file.name}. Thumbnail generation not supported in browser.`,
        );
        isUnsupportedFormat = true;
      } else {
        console.warn(
          `Failed to create thumbnail for ${photo.file.name}:`,
          error,
        );
      }

      // Clean up on error
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        tempImageUrl = null;
      }

      // Mark as error and don't use fallback for unsupported formats
      thumbnailError = true;
      thumbnailUrl = '';
    }
  }

  function handleLoad(e: Event) {
    const image = e.target as HTMLImageElement;
    image.classList.add('loaded');
  }

  const getAspectRatio = (photo: Photo) => `${photo.width / photo.height}/1`;

  $effect(() => {
    // Reset error states when photo changes
    thumbnailError = false;
    isUnsupportedFormat = false;

    // FIXME: Find a way to improve the performance when the images are removed and the
    //  gallery list is updated. This is masking it.
    if (image) {
      image.classList.remove('loaded');
    }

    if (originalUrl) {
      resizeImage();
    }

    // Cleanup function to revoke URLs when component unmounts or photo changes
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    };
  });
</script>

<figure
  class={cn(
    'relative w-full bg-black/20',
    !lockAspectRatio && 'h-full',
    className,
  )}
  style={getFigureStyle()}
>
  {#if thumbnailError}
    <!-- Placeholder for unsupported formats or error cases -->
    <div
      class="flex flex-col items-center justify-center w-full h-full min-h-[200px] text-gray-400"
    >
      <IconImage class="w-12 h-12 mb-2 opacity-50" />
      {#if isUnsupportedFormat}
        <span class="text-xs text-center px-2">
          HEIC format<br />
          <span class="text-[10px] opacity-75">Preview not supported</span>
        </span>
      {:else}
        <span class="text-xs">Preview unavailable</span>
      {/if}
    </div>
  {:else}
    <img
      bind:this={image}
      src={thumbnailUrl}
      alt=""
      width="auto"
      height="auto"
      class="image-preview w-full h-full object-cover"
      onload={handleLoad}
    />
  {/if}
  <figcaption
    class="flex gap-2 items-center absolute inset-0 top-auto z-2 bg-black/50 p-2 text-xs"
  >
    <span class="icons flex-shrink-0">
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
    <span class="truncate min-w-0" title={photo.file.name}
      >{photo.file.name}</span
    >
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
