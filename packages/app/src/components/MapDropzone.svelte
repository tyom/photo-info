<script lang="ts">
  import { gallery, fitToAllMarkers } from '$runes';
  import { onMount } from 'svelte';

  const MAP_EDGE_PADDING = 50;
  const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'http://localhost:3001';

  let isDraggingOver = $state(false);
  let dragCounter = 0;
  let isProcessingUrl = $state(false);
  let errorMessage = $state<string | null>(null);
  let processingMessage = $state<string | null>(null);

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

  function isBasicValidUrl(url: string): { valid: boolean; reason?: string } {
    // Check for data URLs
    if (url.startsWith('data:image/')) {
      return { valid: true };
    }

    try {
      const urlObj = new URL(url);
      // Check if it's a valid HTTP(S) URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, reason: 'URL must use HTTP or HTTPS protocol' };
      }
      // Accept any HTTP/HTTPS URL - we'll check if it's an image later
      return { valid: true };
    } catch {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  async function checkIfUrlIsImage(
    url: string,
  ): Promise<{ isImage: boolean; mimeType?: string; error?: string }> {
    processingMessage = 'Checking URL content type...';

    // Use proxy server to check if URL is an image to avoid CORS issues
    const proxyUrl = `${PROXY_URL}/proxy`;

    try {
      // Use proxy with checkOnly flag to just verify it's an image without downloading
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          checkOnly: true, // Only check if it's an image
          headers: {
            Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
          },
        }),
      });

      if (!proxyResponse.ok) {
        const errorData = await proxyResponse.json();
        return {
          isImage: false,
          error:
            errorData.error || `Failed to check URL (${proxyResponse.status})`,
        };
      }

      const responseData = await proxyResponse.json();

      if (responseData.isImage) {
        return {
          isImage: true,
          mimeType: responseData.contentType || 'image/jpeg',
        };
      } else {
        return {
          isImage: false,
          error: responseData.contentType
            ? `URL points to ${responseData.contentType} content, not an image`
            : 'URL does not appear to be an image',
        };
      }
    } catch (proxyError) {
      console.error('Proxy server failed for image check:', proxyError);

      // If proxy is not available, inform user
      return {
        isImage: false,
        error:
          'Cannot verify URL. Make sure the proxy server is running (npm run dev in packages/image-proxy)',
      };
    }
  }

  async function downloadImageAsFile(
    url: string,
  ): Promise<{ file: File | null; error?: string }> {
    try {
      let blob: Blob;
      let filename: string;

      processingMessage = 'Downloading image...';

      // Handle data URLs locally
      if (url.startsWith('data:image/')) {
        const [header, data] = url.split(',');
        if (!data) {
          throw new Error('Invalid data URL format');
        }

        const mimeMatch = header.match(/data:(image\/[^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        processingMessage = 'Decoding image data...';

        // Decode base64 data
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        blob = new Blob([bytes], { type: mimeType });
        // Generate filename based on mime type
        const ext = mimeType.split('/')[1] || 'jpg';
        filename = `pasted-image-${Date.now()}.${ext}`;
      } else {
        // Use proxy server for regular URLs to avoid CORS issues
        processingMessage = `Fetching image from ${new URL(url).hostname}...`;

        const proxyUrl = `${PROXY_URL}/proxy`;

        try {
          const proxyResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              includeImage: true,
              includeExif: false, // We'll parse EXIF client-side using photo-info
              headers: {
                Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
              },
            }),
          });

          if (!proxyResponse.ok) {
            const errorData = await proxyResponse.json();
            throw new Error(
              errorData.error || `Proxy server error (${proxyResponse.status})`,
            );
          }

          const responseData = await proxyResponse.json();

          if (!responseData.blob || !responseData.blob.data) {
            throw new Error('No image data received from proxy');
          }

          processingMessage = 'Processing image...';

          // Convert base64 back to blob
          const binaryString = atob(responseData.blob.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          blob = new Blob([bytes], { type: responseData.blob.type });

          // Extract filename from URL or generate one
          const urlPath = new URL(url).pathname;
          const defaultExt = responseData.blob.type.split('/')[1] || 'jpg';
          filename =
            urlPath.substring(urlPath.lastIndexOf('/') + 1) ||
            `image-${Date.now()}.${defaultExt}`;
        } catch (proxyError) {
          console.error(
            'Proxy server failed, falling back to direct fetch:',
            proxyError,
          );

          // Fallback to direct fetch if proxy fails
          processingMessage = 'Proxy unavailable, trying direct download...';

          const response = await fetch(url, {
            headers: {
              Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache',
          });

          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Image not found (404)');
            } else if (response.status === 403) {
              throw new Error(
                'Access forbidden (403) - the server denied access',
              );
            } else if (response.status >= 500) {
              throw new Error(`Server error (${response.status})`);
            } else {
              throw new Error(`Failed to download (HTTP ${response.status})`);
            }
          }

          // Get the content type from headers
          const contentType =
            response.headers.get('Content-Type') || 'image/jpeg';

          // Validate that it's actually an image
          if (!contentType.startsWith('image/')) {
            throw new Error(
              `Downloaded file is not an image (type: ${contentType})`,
            );
          }

          blob = await response.blob();

          // Extract filename from URL or generate one
          const urlPath = new URL(url).pathname;
          const defaultExt = contentType.split('/')[1] || 'jpg';
          filename =
            urlPath.substring(urlPath.lastIndexOf('/') + 1) ||
            `image-${Date.now()}.${defaultExt}`;
        }
      }

      processingMessage = 'Creating file object...';

      // Create a File object from the blob
      const file = new File([blob], filename, {
        type: blob.type,
        lastModified: Date.now(),
      });

      // Debug logging
      console.log('Downloaded file:', {
        name: filename,
        size: file.size,
        sizeInMB: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type,
        url: url.startsWith('data:') ? 'data URL' : url,
        usedProxy: !url.startsWith('data:'),
      });

      return { file };
    } catch (error) {
      console.error('Failed to download image:', error);

      let errorMsg = 'Failed to download image';

      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          errorMsg =
            'Cannot access this URL. Make sure the proxy server is running (npm run dev in packages/image-proxy) or try downloading the image first, then drag it into the app.';
        } else if (error.message.includes('NetworkError')) {
          errorMsg = 'Network error - check your internet connection';
        } else {
          errorMsg = `Network error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      return { file: null, error: errorMsg };
    }
  }

  async function handleUrlPaste(url: string) {
    // Clear any previous errors
    errorMessage = null;

    // First check if it's a valid URL format
    const basicValidation = isBasicValidUrl(url);
    if (!basicValidation.valid) {
      console.warn('Invalid URL:', url, basicValidation.reason);
      errorMessage = basicValidation.reason || 'Invalid URL';
      // Clear error after 5 seconds
      setTimeout(() => {
        errorMessage = null;
      }, 5000);
      return;
    }

    isProcessingUrl = true;
    processingMessage = 'Checking if URL is an image...';

    try {
      // For data URLs, skip the image check
      if (!url.startsWith('data:image/')) {
        const imageCheck = await checkIfUrlIsImage(url);
        if (!imageCheck.isImage) {
          errorMessage =
            imageCheck.error || 'URL does not point to an image file';
          isProcessingUrl = false;
          processingMessage = null;
          // Clear error after 5 seconds
          setTimeout(() => {
            errorMessage = null;
          }, 5000);
          return;
        }
      }

      processingMessage = 'Starting download...';
      const result = await downloadImageAsFile(url);
      if (result.file) {
        processingMessage = 'Processing EXIF data...';
        await handleFileDrop([result.file]);
        processingMessage = null;
      } else {
        errorMessage = result.error || 'Failed to download image';
        // Clear error after 5 seconds
        setTimeout(() => {
          errorMessage = null;
        }, 5000);
      }
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : 'Failed to process URL';
      // Clear error after 5 seconds
      setTimeout(() => {
        errorMessage = null;
      }, 5000);
    } finally {
      isProcessingUrl = false;
      processingMessage = null;
    }
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

    async function handlePaste(e: ClipboardEvent) {
      // Check for pasted files first
      const files = Array.from(e.clipboardData?.files || []);
      if (files.length > 0) {
        e.preventDefault();
        handleFileDrop(files);
        return;
      }

      // Check for pasted text that might be a URL
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (text) {
        // Check if it looks like it could be a URL
        if (
          text.startsWith('http') ||
          text.startsWith('data:') ||
          text.includes('://')
        ) {
          e.preventDefault();
          await handleUrlPaste(text);
        }
      }
    }

    // Add event listeners to the document
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('paste', handlePaste);

    return () => {
      // Cleanup
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('paste', handlePaste);
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

{#if isProcessingUrl}
  <div class="absolute inset-0 z-30 bg-background/80 pointer-events-none">
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="bg-background/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-2 border-primary animate-pulse"
      >
        <p class="text-xl font-semibold text-primary">
          Processing image from URL...
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          {processingMessage || 'Downloading and parsing EXIF data'}
        </p>
      </div>
    </div>
  </div>
{/if}

{#if errorMessage}
  <div
    class="fixed bottom-4 right-4 z-40 max-w-md animate-in slide-in-from-bottom-5"
  >
    <div
      class="bg-destructive/90 text-destructive-foreground backdrop-blur-sm rounded-lg p-4 shadow-2xl border border-destructive"
    >
      <div class="flex items-start gap-3">
        <svg
          class="w-5 h-5 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-sm">Failed to process image</p>
          <p class="text-sm mt-1 opacity-90">
            {errorMessage}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}
