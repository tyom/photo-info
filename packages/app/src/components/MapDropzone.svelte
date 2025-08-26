<script lang="ts">
  import { gallery, fitToAllMarkers } from '$runes';
  import { onMount } from 'svelte';

  const MAP_EDGE_PADDING = 50;

  let isDraggingOver = $state(false);
  let dragCounter = 0;

  async function handleFileDrop(files: File[]) {
    if (files.length === 0) return;

    await gallery.addPhotos(files);

    // Open sidebar if it's closed
    if (!gallery.sidebarOpen) {
      gallery.toggleSidebar(true);
    }

    // Wait for next tick to ensure DOM updates are complete
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Fit map to show all markers
    await fitToAllMarkers({
      paddingTopLeft: [MAP_EDGE_PADDING, MAP_EDGE_PADDING],
      paddingBottomRight: [
        gallery.sidebarOpen ? 320 + MAP_EDGE_PADDING : MAP_EDGE_PADDING,
        MAP_EDGE_PADDING,
      ],
    });
  }

  onMount(() => {
    function handleDragEnter(e: DragEvent) {
      e.preventDefault();
      dragCounter++;

      // Check if we're dragging files
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        const hasFiles = Array.from(e.dataTransfer.items).some(
          (item) => item.kind === 'file',
        );
        if (hasFiles) {
          isDraggingOver = true;
        }
      }
    }

    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      dragCounter--;

      if (dragCounter === 0) {
        isDraggingOver = false;
      }
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    }

    function handleDrop(e: DragEvent) {
      e.preventDefault();
      dragCounter = 0;
      isDraggingOver = false;

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        handleFileDrop(files);
      }
    }

    // Add event listeners to the document
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      // Cleanup
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  });
</script>

{#if isDraggingOver}
  <div class="absolute inset-0 z-30 bg-primary/10 pointer-events-none">
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-2 border-primary"
      >
        <p class="text-2xl font-semibold text-primary">
          Drop photos to add to map
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          Photos with GPS data will appear on the map
        </p>
      </div>
    </div>
  </div>
{/if}
