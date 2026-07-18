export type TokenPersistence = 'local' | 'session';

const ACCESS_TOKEN_KEY = 'codeconnect.auth.accessToken';
const REMEMBER_PREFERENCE_KEY = 'codeconnect.auth.rememberPreference';

export function getAccessToken(): string | null {
  const sessionToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const localToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (sessionToken && localToken) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  return sessionToken || localToken;
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export function setAccessToken(
  token: string,
  persistence: TokenPersistence,
) {
  clearAccessToken();
  const storage =
    persistence === 'local' ? window.localStorage : window.sessionStorage;
  storage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function saveRememberPreference(rememberMe: boolean) {
  window.sessionStorage.setItem(
    REMEMBER_PREFERENCE_KEY,
    String(rememberMe),
  );
}

export function consumeRememberPreference(): boolean | null {
  const value = window.sessionStorage.getItem(REMEMBER_PREFERENCE_KEY);
  window.sessionStorage.removeItem(REMEMBER_PREFERENCE_KEY);

  if (value === null) return null;
  return value === 'true';
}
