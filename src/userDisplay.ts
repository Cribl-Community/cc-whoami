import type { CriblUser } from './global';

/** Two-letter initials for a user, derived from initials, name, or username. */
export function initialsFor(user: CriblUser): string {
  if (user.initials) return user.initials.slice(0, 2).toUpperCase();
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first || last) {
    return (
      `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() ||
      first?.slice(0, 2).toUpperCase() ||
      ''
    );
  }
  return (user.username || user.id || '?').slice(0, 2).toUpperCase();
}

/** The best human-readable name for a user. */
export function displayNameFor(user: CriblUser): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.username || user.id;
}
