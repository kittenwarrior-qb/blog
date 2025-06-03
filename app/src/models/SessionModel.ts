export class SessionModel {
  static store(key: string, value: any) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
  }

  static get(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  static remove(key: string) {
    sessionStorage.removeItem(key);
  }

  static clear() {
    sessionStorage.clear();
  }
}
