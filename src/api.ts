import type { CriblUser } from './global';
import type {
  AccessProfile,
  AssignedRole,
  AuthPolicyEntry,
  Counted,
  Role,
  Team,
} from './types';

/** Thrown when the app is not running inside the Cribl platform (e.g. `npm run dev`). */
export class PlatformUnavailableError extends Error {
  constructor() {
    super(
      'This app must run inside Cribl. The platform globals (CRIBL_API_URL, getCriblUser) are not available.',
    );
    this.name = 'PlatformUnavailableError';
  }
}

function apiBase(): string {
  const base = window.CRIBL_API_URL;
  if (!base) throw new PlatformUnavailableError();
  return base;
}

/**
 * GET a Cribl API path relative to `CRIBL_API_URL`. The platform fetch proxy
 * injects auth and scopes the request to this app automatically.
 */
async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(apiBase() + path, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ApiError(res.status, path, detail);
  }
  return (await res.json()) as T;
}

/** A failed Cribl API response, carrying the HTTP status and requested path. */
export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly detail?: string;

  constructor(status: number, path: string, detail?: string) {
    super(`Request to ${path} failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
    this.detail = detail;
  }
}

function items<T>(counted: Counted<T> | null | undefined): T[] {
  return counted?.items ?? [];
}

/** Resolve the currently signed-in Cribl user. */
export async function getCurrentUser(): Promise<CriblUser> {
  if (typeof window.getCriblUser !== 'function') throw new PlatformUnavailableError();
  return window.getCriblUser();
}

/** The user's effective role IDs (works on cloud and on-prem). */
async function fetchRoleIds(signal?: AbortSignal): Promise<string[]> {
  return items(await apiGet<Counted<string>>('/authorize/roles', signal));
}

/** The user's effective authorization policy. */
async function fetchPolicies(signal?: AbortSignal): Promise<AuthPolicyEntry[]> {
  return items(await apiGet<Counted<AuthPolicyEntry>>('/authorize/policy', signal));
}

/** All role definitions, used to enrich role IDs. Best-effort. */
async function fetchRoleDefinitions(signal?: AbortSignal): Promise<Map<string, Role>> {
  const roles = items(await apiGet<Counted<Role>>('/system/roles', signal));
  return new Map(roles.map((r) => [r.id, r]));
}

/** All team definitions. */
async function fetchTeams(signal?: AbortSignal): Promise<Team[]> {
  return items(await apiGet<Counted<Team>>('/system/teams', signal));
}

/** The set of user identifiers that belong to a given team. */
async function fetchTeamMemberIds(teamId: string, signal?: AbortSignal): Promise<string[]> {
  return items(
    await apiGet<Counted<string>>(`/system/teams/${encodeURIComponent(teamId)}/users`, signal),
  );
}

/** Run promise-returning tasks with a bounded concurrency. */
async function mapWithConcurrency<T, R>(
  input: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(input.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, input.length) }, async () => {
    while (cursor < input.length) {
      const index = cursor++;
      results[index] = await task(input[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

function isMember(memberIds: string[], user: CriblUser): boolean {
  const identifiers = new Set(
    [user.id, user.username, user.email].filter(Boolean).map((v) => v!.toLowerCase()),
  );
  return memberIds.some((id) => identifiers.has(id.toLowerCase()));
}

/**
 * Assemble the full access profile for the signed-in user. Each piece degrades
 * gracefully: if an enrichment call fails (e.g. missing permission), the core
 * data is still returned and a warning is recorded.
 */
export async function loadAccessProfile(signal?: AbortSignal): Promise<AccessProfile> {
  const warnings: string[] = [];

  const user = await getCurrentUser();

  const [roleIds, policies] = await Promise.all([
    fetchRoleIds(signal).catch((err: unknown) => {
      warnings.push(`Could not load roles: ${describeError(err)}`);
      return [] as string[];
    }),
    fetchPolicies(signal).catch((err: unknown) => {
      warnings.push(`Could not load authorization policy: ${describeError(err)}`);
      return [] as AuthPolicyEntry[];
    }),
  ]);

  const roleDefs = await fetchRoleDefinitions(signal).catch(() => {
    // Enrichment is optional; fall back to raw IDs without a user-facing warning.
    return new Map<string, Role>();
  });

  const roles: AssignedRole[] = roleIds.map((id) => {
    const def = roleDefs.get(id);
    return {
      id,
      title: def?.title,
      description: def?.description,
      tags: def?.tags,
      policyCount: def?.policy?.length,
    };
  });

  const teams = await loadUserTeams(user, warnings, signal);

  return { user, roles, policies, teams, warnings };
}

async function loadUserTeams(
  user: CriblUser,
  warnings: string[],
  signal?: AbortSignal,
): Promise<Team[]> {
  let allTeams: Team[];
  try {
    allTeams = await fetchTeams(signal);
  } catch (err) {
    warnings.push(`Could not load teams: ${describeError(err)}`);
    return [];
  }

  let membershipUnknown = false;
  const membership = await mapWithConcurrency(allTeams, 5, async (team) => {
    try {
      const memberIds = await fetchTeamMemberIds(team.id, signal);
      return isMember(memberIds, user);
    } catch {
      membershipUnknown = true;
      return false;
    }
  });

  if (membershipUnknown) {
    warnings.push('Membership for some teams could not be verified and those teams were omitted.');
  }

  return allTeams.filter((_, i) => membership[i]);
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403 || err.status === 401) return 'access denied';
    return `HTTP ${err.status}`;
  }
  if (err instanceof Error) return err.message;
  return 'unknown error';
}
