/**
 * Ambient declarations for the Cribl app platform globals.
 * These are injected on `window` by the platform at runtime and are read-only.
 * See AGENTS.md for details.
 */

export interface CriblUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  initials?: string;
}

declare global {
  interface Window {
    /** Base URL for all Cribl API calls, e.g. `https://localhost:9000/api/v1`. */
    CRIBL_API_URL?: string;
    /** Base path the app is mounted at, e.g. `/app-ui/my-app`. */
    CRIBL_BASE_PATH?: string;
    /** Resolves to the currently signed-in Cribl user. Memoized by the platform. */
    getCriblUser?: () => Promise<CriblUser>;
  }
}
