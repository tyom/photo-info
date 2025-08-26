import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the photo-info module with factory function
vi.mock('photo-info', () => {
  return {
    getPhotoInfo: vi.fn(),
    getMappedPhotoInfo: vi.fn(),
    getGroupedPhotoInfo: vi.fn(),
    getComprehensivePhotoInfo: vi.fn(),
  };
});

// Import after mocking
import * as photoInfo from 'photo-info';
import type { Env } from './rate-limiter';
import { createKVMock } from './test-utils';
import app from './index';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock File constructor - TypeScript doesn't have these types in Node environment
declare global {
  interface FilePropertyBag {
    type?: string;
    lastModified?: number;
  }
}

(global as unknown as { File: typeof File }).File = class File extends Blob {
  name: string;
  lastModified: number;

  constructor(
    fileBits: Array<ArrayBuffer | ArrayBufferView | Blob | string>,
    fileName: string,
    options?: FilePropertyBag,
  ) {
    super(fileBits, options);
    this.name = fileName;
    this.lastModified = options?.lastModified || Date.now();
  }
};

// Mock btoa for base64 encoding
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// Type definitions for responses
interface ErrorResponse {
  error: string;
  message?: string;
  details?: string;
  retryAfter?: number;
}

interface HealthResponse {
  status: string;
  environment: string;
}

interface CheckResponse {
  isImage: boolean;
  contentType: string | null;
  status: number;
  statusText: string;
}

interface ProxyResponse {
  blob?: {
    size: number;
    type: string;
    data: string;
  };
  photoInfo?: Record<string, unknown>;
  mapped?: Record<string, unknown>;
  grouped?: Record<string, unknown>;
}

describe('Image Proxy Server', () => {
  const env: Env = {
    RATE_LIMIT_KV: createKVMock(),
    ENVIRONMENT: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the KV store
    const kv = env.RATE_LIMIT_KV as unknown as { clear?: () => void };
    if (kv.clear) kv.clear();
    // Mock console methods to suppress expected error logs in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Reset mock return values
    vi.mocked(photoInfo.getPhotoInfo).mockResolvedValue({
      width: 1920,
      height: 1080,
      format: 'jpeg',
    } as unknown as Awaited<ReturnType<typeof photoInfo.getPhotoInfo>>);
    vi.mocked(photoInfo.getMappedPhotoInfo).mockResolvedValue({
      camera: { make: 'Canon', model: 'EOS 5D' },
      lens: { make: 'Canon', model: 'EF 24-70mm' },
      gps: { latitude: 40.7128, longitude: -74.006 },
    } as unknown as Awaited<ReturnType<typeof photoInfo.getMappedPhotoInfo>>);
    vi.mocked(photoInfo.getGroupedPhotoInfo).mockResolvedValue({
      camera: {
        make: { value: 'Canon', label: 'Make' },
        model: { value: 'EOS 5D', label: 'Model' },
      },
    } as unknown as Awaited<ReturnType<typeof photoInfo.getGroupedPhotoInfo>>);
    vi.mocked(photoInfo.getComprehensivePhotoInfo).mockResolvedValue({
      original: { width: 1920, height: 1080 },
      mapped: { camera: { make: 'Canon' } },
      grouped: { camera: {} },
    } as unknown as Awaited<
      ReturnType<typeof photoInfo.getComprehensivePhotoInfo>
    >);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await app.request('/health', {}, env);
      const data = (await response.json()) as HealthResponse;

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'ok',
        environment: 'test',
      });
    });

    it('should default to development environment', async () => {
      const envWithoutEnv = { RATE_LIMIT_KV: env.RATE_LIMIT_KV };
      const response = await app.request('/health', {}, envWithoutEnv);
      const data = (await response.json()) as HealthResponse;

      expect(data.environment).toBe('development');
    });
  });

  describe('POST /proxy', () => {
    describe('Validation', () => {
      it('should return 400 when URL is missing', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          },
          env,
        );

        expect(response.status).toBe(400);
        const data = (await response.json()) as ErrorResponse;
        expect(data.error).toBe('URL is required');
      });

      it('should return error when fetch fails', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com/image.jpg' }),
          },
          env,
        );

        expect(response.status).toBe(500);
        const data = (await response.json()) as ErrorResponse;
        expect(data.error).toBe('Failed to process image');
        expect(data.details).toBe('Network error');
      });

      it('should return error for non-OK response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: new Map(),
        });

        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com/image.jpg' }),
          },
          env,
        );

        expect(response.status).toBe(404);
        const data = (await response.json()) as ErrorResponse;
        expect(data.error).toBe('Failed to fetch image: Not Found');
      });

      it('should return error for non-image content type', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'text/html',
          },
          arrayBuffer: async () => new ArrayBuffer(0),
        });

        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com/page.html' }),
          },
          env,
        );

        expect(response.status).toBe(400);
        const data = (await response.json()) as ErrorResponse;
        expect(data.error).toBe('URL does not point to an image');
      });
    });

    describe('checkOnly mode', () => {
      it('should use HEAD request when checkOnly is true', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          headers: {
            get: () => 'image/jpeg',
          },
        });

        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              checkOnly: true,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as CheckResponse;
        expect(data).toEqual({
          isImage: true,
          contentType: 'image/jpeg',
          status: 200,
          statusText: 'OK',
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com/image.jpg',
          expect.objectContaining({ method: 'HEAD' }),
        );
      });

      it('should fallback to GET if HEAD fails in checkOnly mode', async () => {
        // HEAD request fails
        mockFetch.mockRejectedValueOnce(new Error('HEAD not supported'));

        // GET request succeeds
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: () => 'image/png',
          },
          arrayBuffer: async () => new ArrayBuffer(100),
        });

        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.png',
              checkOnly: true,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as CheckResponse;
        expect(data.isImage).toBe(true);
        expect(data.contentType).toBe('image/png');
      });
    });

    describe('Image processing', () => {
      const mockImageBuffer = new ArrayBuffer(100);

      beforeEach(() => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: {
            get: () => 'image/jpeg',
          },
          arrayBuffer: async () => mockImageBuffer,
        });
      });

      it('should include base64 image data by default', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeExif: false,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.blob).toBeDefined();
        expect(data.blob?.size).toBe(100);
        expect(data.blob?.type).toBe('image/jpeg');
        expect(data.blob?.data).toBeDefined();
      });

      it('should exclude image data when includeImage is false', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeImage: false,
              includeExif: false,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.blob).toBeUndefined();
      });

      it('should process basic EXIF format', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeImage: false,
              exifFormat: 'basic',
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.photoInfo).toBeDefined();
        expect(photoInfo.getPhotoInfo).toHaveBeenCalled();
      });

      it('should process mapped EXIF format', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeImage: false,
              exifFormat: 'mapped',
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.mapped).toBeDefined();
        expect(photoInfo.getMappedPhotoInfo).toHaveBeenCalled();
      });

      it('should process grouped EXIF format', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeImage: false,
              exifFormat: 'grouped',
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.grouped).toBeDefined();
        expect(photoInfo.getGroupedPhotoInfo).toHaveBeenCalled();
      });

      it('should process all EXIF formats by default', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeImage: false,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.photoInfo).toBeDefined();
        expect(data.mapped).toBeDefined();
        expect(data.grouped).toBeDefined();
        expect(photoInfo.getComprehensivePhotoInfo).toHaveBeenCalled();
      });

      it('should exclude EXIF when includeExif is false', async () => {
        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeImage: false,
              includeExif: false,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        const data = (await response.json()) as ProxyResponse;
        expect(data.photoInfo).toBeUndefined();
        expect(data.mapped).toBeUndefined();
        expect(data.grouped).toBeUndefined();
      });
    });

    describe('Headers', () => {
      it('should use custom headers when provided', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'image/jpeg',
          },
          arrayBuffer: async () => new ArrayBuffer(100),
        });

        const customHeaders = {
          Authorization: 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        };

        await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              headers: customHeaders,
              includeExif: false,
            }),
          },
          env,
        );

        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com/image.jpg',
          expect.objectContaining({
            headers: expect.objectContaining(customHeaders),
          }),
        );
      });

      it('should include default browser-like headers', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'image/jpeg',
          },
          arrayBuffer: async () => new ArrayBuffer(100),
        });

        await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeExif: false,
            }),
          },
          env,
        );

        expect(mockFetch).toHaveBeenCalledWith(
          'https://example.com/image.jpg',
          expect.objectContaining({
            headers: expect.objectContaining({
              'User-Agent': expect.stringContaining('Mozilla'),
              Accept: expect.stringContaining('image/'),
            }),
          }),
        );
      });
    });

    describe('Rate limiting', () => {
      it('should apply rate limiting to /proxy endpoint', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          headers: {
            get: () => 'image/jpeg',
          },
          arrayBuffer: async () => new ArrayBuffer(100),
        });

        const response = await app.request(
          '/proxy',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': 'test-user',
            },
            body: JSON.stringify({
              url: 'https://example.com/image.jpg',
              includeExif: false,
            }),
          },
          env,
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('X-RateLimit-User-Limit')).toBe('20');
        expect(response.headers.get('X-RateLimit-User-Remaining')).toBe('19');
      });
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await app.request(
        '/proxy',
        {
          method: 'OPTIONS',
        },
        env,
      );

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });

    it('should include CORS headers in responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'image/jpeg',
        },
        arrayBuffer: async () => new ArrayBuffer(100),
      });

      const response = await app.request(
        '/proxy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: 'https://example.com/image.jpg',
            includeExif: false,
          }),
        },
        env,
      );

      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
    });
  });
});
