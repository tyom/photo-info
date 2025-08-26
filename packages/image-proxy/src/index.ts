import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getComprehensivePhotoInfo,
  getMappedPhotoInfo,
  getGroupedPhotoInfo,
  getPhotoInfo,
  type PhotoInfo,
  type MappedExifData,
  type GroupedExifData,
} from 'photo-info';
import RateLimiter, { type Env } from './rate-limiter';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// Apply rate limiting to the proxy endpoint
app.use('/proxy', async (c, next) => {
  const rateLimiter = new RateLimiter(c.env.RATE_LIMIT_KV);
  return rateLimiter.middleware(c, next);
});

app.post('/proxy', async (c) => {
  try {
    const body = await c.req.json();
    const {
      url,
      checkOnly = false, // If true, only check if URL is an image without downloading
      includeImage = true, // Include base64 image data
      includeExif = true, // Include EXIF data
      exifFormat = 'all', // 'all' | 'basic' | 'mapped' | 'grouped'
      headers = {}, // Custom headers to pass to fetch
    } = body;

    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }

    // Merge custom headers with default browser-like headers
    const fetchHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      ...headers,
    };

    // If only checking, use HEAD request first
    if (checkOnly) {
      try {
        const headResponse = await fetch(url, {
          method: 'HEAD',
          headers: fetchHeaders,
        });

        const contentType = headResponse.headers.get('content-type');
        const isImage = contentType?.startsWith('image/') || false;

        return c.json({
          isImage,
          contentType,
          status: headResponse.status,
          statusText: headResponse.statusText,
        });
      } catch (headError) {
        // If HEAD fails, try a regular GET
        console.log('HEAD request failed, trying GET:', headError);
      }
    }

    const response = await fetch(url, { headers: fetchHeaders });

    if (!response.ok) {
      return c.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        response.status as 400 | 401 | 403 | 404 | 500 | 502 | 503,
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return c.json({ error: 'URL does not point to an image' }, 400);
    }

    // If only checking, return early
    if (checkOnly) {
      return c.json({
        isImage: true,
        contentType,
        status: response.status,
        statusText: response.statusText,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: contentType });

    interface ResponseData {
      blob?: {
        size: number;
        type: string;
        data: string;
      };
      photoInfo?: PhotoInfo;
      mapped?: MappedExifData;
      grouped?: GroupedExifData;
    }

    const responseData: ResponseData = {};

    // Include image data if requested
    if (includeImage) {
      // Convert ArrayBuffer to base64 string
      const uint8Array = new Uint8Array(arrayBuffer);
      let binaryString = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binaryString);

      responseData.blob = {
        size: blob.size,
        type: blob.type,
        data: base64,
      };
    }

    // Include EXIF data if requested
    if (includeExif) {
      const file = new File([blob], 'image', { type: contentType });

      // Return different formats based on exifFormat parameter
      switch (exifFormat) {
        case 'basic': {
          responseData.photoInfo = await getPhotoInfo(file);
          break;
        }

        case 'mapped': {
          responseData.mapped = await getMappedPhotoInfo(file);
          break;
        }

        case 'grouped': {
          responseData.grouped = await getGroupedPhotoInfo(file);
          break;
        }

        case 'all':
        default: {
          const comprehensiveInfo = await getComprehensivePhotoInfo(file);
          responseData.photoInfo = comprehensiveInfo.original;
          responseData.mapped = comprehensiveInfo.mapped;
          responseData.grouped = comprehensiveInfo.grouped;
          break;
        }
      }
    }

    return c.json(responseData);
  } catch (error) {
    console.error('Error processing image:', error);
    return c.json(
      {
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Export the app for Cloudflare Workers
export default app;
