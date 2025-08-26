<script lang="ts">
  import { type Photo } from '$runes';
  import IconClose from 'virtual:icons/ic/baseline-close';
  import IconZoomIn from 'virtual:icons/ic/baseline-zoom-in';
  import IconZoomOut from 'virtual:icons/ic/baseline-zoom-out';
  import IconFitScreen from 'virtual:icons/ic/baseline-fit-screen';
  import { Button } from './ui/button';

  type $Props = {
    photo: Photo;
    onClose: () => void;
  };

  const { photo, onClose }: $Props = $props();

  let containerElement = $state<HTMLButtonElement>();
  let scale = $state(1);
  let translateX = $state(0);
  let translateY = $state(0);
  let isDragging = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let initialTranslateX = 0;
  let initialTranslateY = 0;

  const imageUrl = URL.createObjectURL(photo.file);
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;
  const ZOOM_STEP = 0.25;

  function handleZoomIn() {
    scale = Math.min(scale + ZOOM_STEP, MAX_SCALE);
  }

  function handleZoomOut() {
    scale = Math.max(scale - ZOOM_STEP, MIN_SCALE);
  }

  function handleFitToScreen() {
    scale = 1;
    translateX = 0;
    translateY = 0;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    scale = Math.max(MIN_SCALE, Math.min(scale + delta, MAX_SCALE));
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return; // Only left click
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialTranslateX = translateX;
    initialTranslateY = translateY;
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    translateX = initialTranslateX + (e.clientX - dragStartX);
    translateY = initialTranslateY + (e.clientY - dragStartY);
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === '+' || e.key === '=') {
      handleZoomIn();
    } else if (e.key === '-' || e.key === '_') {
      handleZoomOut();
    } else if (e.key === '0') {
      handleFitToScreen();
    }
  }

  function handleBackdropKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.target === containerElement) {
        onClose();
      }
    }
  }

  $effect(() => {
    // Cleanup URL when component unmounts
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  });

  // Add global event listeners
  $effect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<button
  bind:this={containerElement}
  class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 border-0"
  type="button"
  aria-label="Close modal (click backdrop)"
  onclick={(e) => e.target === containerElement && onClose()}
  onkeydown={handleBackdropKeyDown}
>
  <!-- Controls -->
  <div
    class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
  >
    <Button
      variant="ghost"
      size="sm"
      onclick={handleZoomOut}
      disabled={scale <= MIN_SCALE}
    >
      <IconZoomOut />
    </Button>
    <span class="text-sm font-medium px-2 min-w-[60px] text-center">
      {Math.round(scale * 100)}%
    </span>
    <Button
      variant="ghost"
      size="sm"
      onclick={handleZoomIn}
      disabled={scale >= MAX_SCALE}
    >
      <IconZoomIn />
    </Button>
    <div class="w-px h-6 bg-border mx-1"></div>
    <Button variant="ghost" size="sm" onclick={handleFitToScreen}>
      <IconFitScreen />
    </Button>
  </div>

  <!-- Close button -->
  <Button
    variant="ghost"
    size="icon"
    class="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm"
    onclick={onClose}
  >
    <IconClose />
  </Button>

  <!-- Image info -->
  <div
    class="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg"
  >
    <p class="text-sm font-medium">{photo.file.name}</p>
    {#if photo.width && photo.height}
      <p class="text-xs text-muted-foreground">
        {photo.width} × {photo.height}px
      </p>
    {/if}
  </div>

  <!-- Image container -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="img"
    aria-label="Zoomable image viewer"
    class="relative overflow-hidden select-none"
    style="cursor: {isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'}"
    onwheel={handleWheel}
    onmousedown={handleMouseDown}
  >
    <img
      src={imageUrl}
      alt={photo.file.name}
      class="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200 ease-out"
      style="transform: scale({scale}) translate({translateX /
        scale}px, {translateY / scale}px)"
      draggable={false}
    />
  </div>
</button>
