export interface UserData {
  id?: string;
  name?: string;
  email?: string;
}

const STORAGE_KEY = "epicgame_user";

export function saveUser(user: UserData) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    // ignore
  }
}

export function getUser(): UserData | null {
  try {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

export function clearUser() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
