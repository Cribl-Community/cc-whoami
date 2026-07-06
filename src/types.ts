import type { CriblUser } from './global';

/** Generic Cribl list envelope: `{ count, items }`. */
export interface Counted<T> {
  count?: number;
  items?: T[];
}

/** A single entry in an authorization policy: what actions are allowed on an object. */
export interface AuthPolicyEntry {
  object: string;
  actions: string[];
}

/** A Cribl role definition (from `/system/roles`). */
export interface Role {
  id: string;
  title?: string;
  description?: string;
  policy?: string[];
  tags?: string[];
}

/** A Cribl team definition (from `/system/teams`). */
export interface Team {
  id: string;
  name: string;
  description?: string;
  roles?: string[];
  ssoGroupIds?: string[];
}

/** A role assigned to the user, optionally enriched with its full definition. */
export interface AssignedRole {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  policyCount?: number;
}

/** Everything the dashboard needs about the signed-in user. */
export interface AccessProfile {
  user: CriblUser;
  roles: AssignedRole[];
  policies: AuthPolicyEntry[];
  teams: Team[];
  /** Non-fatal warnings collected while assembling the profile (e.g. permission gaps). */
  warnings: string[];
}
