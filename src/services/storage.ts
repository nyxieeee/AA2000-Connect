/**
 * storage.ts
 * Simple LocalStorage wrapper for persistence
 */

export const storage = {
  get: <T>(key: string): T | null => {
    const data = localStorage.getItem(`aa2000_${key}`);
    return data ? JSON.parse(data) : null;
  },

  set: <T>(key: string, value: T): void => {
    localStorage.setItem(`aa2000_${key}`, JSON.stringify(value));
  },

  remove: (key: string): void => {
    localStorage.removeItem(`aa2000_${key}`);
  },

  clear: (): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('aa2000_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
