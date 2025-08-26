// Simple mock KV for testing
export class SimpleKVMock {
  private store = new Map<string, string>();

  async get<T = string>(
    key: string,
    options?: string | { type?: string },
  ): Promise<T | null> {
    const value = this.store.get(key);
    if (!value) return null;

    const type = typeof options === 'string' ? options : options?.type;
    return (type === 'json' ? JSON.parse(value) : value) as T;
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ArrayBufferView | ReadableStream,
  ): Promise<void> {
    const stringValue = typeof value === 'string' ? value : String(value);
    this.store.set(key, stringValue);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

export const createKVMock = (): KVNamespace => {
  return new SimpleKVMock() as unknown as KVNamespace;
};
