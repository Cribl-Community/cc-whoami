import type { CriblUser } from '../global';
import { initialsFor } from '../userDisplay';

export function Avatar({ user }: { user: CriblUser }) {
  return (
    <div className="avatar" aria-hidden="true">
      {initialsFor(user)}
    </div>
  );
}
