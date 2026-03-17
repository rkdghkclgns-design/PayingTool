const STORAGE_PREFIX = 'payingtool_';
const MAX_STORAGE_BYTES = 4 * 1024 * 1024; // 4MB warning threshold

export const storageService = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('localStorage 용량 초과. 데이터를 내보내고 불필요한 프로젝트를 삭제하세요.');
      }
      throw e;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  getStorageUsage(): { used: number; total: number; percentage: number } {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key) || '';
        used += key.length + value.length;
      }
    }
    const usedBytes = used * 2; // UTF-16
    return {
      used: usedBytes,
      total: 5 * 1024 * 1024,
      percentage: Math.round((usedBytes / (5 * 1024 * 1024)) * 100),
    };
  },

  isNearCapacity(): boolean {
    const { used } = this.getStorageUsage();
    return used > MAX_STORAGE_BYTES;
  },

  listKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  },

  clearAll(): void {
    const keys = this.listKeys();
    keys.forEach(key => this.remove(key));
  },
};
