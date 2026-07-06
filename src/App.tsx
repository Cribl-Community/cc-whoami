import { useCallback, useEffect, useState } from 'react';
import { Text, Button, Spinner, Alert, Link } from '@capra/core';
import { ReloadOutlined } from '@capra/icons';
import { loadAccessProfile, PlatformUnavailableError } from './api';
import type { AccessProfile } from './types';
import { Avatar } from './components/Avatar';
import { displayNameFor } from './userDisplay';
import { RolesSection } from './components/RolesSection';
import { TeamsSection } from './components/TeamsSection';
import { PoliciesSection } from './components/PoliciesSection';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; profile: AccessProfile }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    setRefreshing(true);
    return loadAccessProfile(signal)
      .then((profile) => {
        if (signal?.aborted) return;
        setState({ status: 'ready', profile });
      })
      .catch((err: unknown) => {
        if (signal?.aborted) return;
        if (err instanceof PlatformUnavailableError) {
          setState({ status: 'unavailable' });
        } else {
          setState({
            status: 'error',
            message: err instanceof Error ? err.message : 'Something went wrong.',
          });
        }
      })
      .finally(() => {
        if (!signal?.aborted) setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title">
          <Text variant="heading-lg" as="h1">
            My Cribl Access
          </Text>
          <Text variant="body-md-normal" color="secondary">
            The roles, teams, and policies that define what you can do in Cribl.
          </Text>
        </div>
        {state.status === 'ready' && (
          <Button
            variant="secondary"
            leadingIcon={ReloadOutlined}
            pending={refreshing}
            onClick={() => void load()}
          >
            Refresh
          </Button>
        )}
      </header>

      {state.status === 'ready' && (
        <UserBanner profile={state.profile} />
      )}

      <main className="app__body">
        {state.status === 'loading' && (
          <div className="app__center">
            <Spinner size="lg" title="Loading your access profile…" />
          </div>
        )}

        {state.status === 'unavailable' && (
          <Alert appearance="info" title="Run this app inside Cribl">
            This app reads your identity, roles, and policies from the Cribl platform, which is only
            available when the app is installed and running inside Cribl. During local development
            (<Text as="code" variant="code">npm run dev</Text>) those platform APIs are not present.{' '}
            <Link href="https://docs.cribl.io/apps" isExternal>
              Learn more about Cribl apps
            </Link>
            .
          </Alert>
        )}

        {state.status === 'error' && (
          <Alert
            appearance="danger"
            title="Couldn’t load your access profile"
            action={{ label: 'Try again', onClick: () => void load() }}
          >
            {state.message}
          </Alert>
        )}

        {state.status === 'ready' && (
          <>
            {state.profile.warnings.length > 0 && (
              <Alert appearance="warning" title="Some details may be incomplete" onDismiss>
                <ul className="warning-list">
                  {state.profile.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </Alert>
            )}
            <div className="app__grid">
              <RolesSection roles={state.profile.roles} />
              <TeamsSection teams={state.profile.teams} />
              <div className="app__grid-wide">
                <PoliciesSection policies={state.profile.policies} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function UserBanner({ profile }: { profile: AccessProfile }) {
  const { user } = profile;
  const meta = [
    { label: 'Username', value: user.username },
    { label: 'Email', value: user.email },
    { label: 'User ID', value: user.id },
  ].filter((m) => Boolean(m.value));

  return (
    <section className="user-banner">
      <Avatar user={user} />
      <div className="user-banner__info">
        <Text variant="heading-md" as="h2">
          {displayNameFor(user)}
        </Text>
        <dl className="user-banner__meta">
          {meta.map((m) => (
            <div key={m.label} className="user-banner__meta-item">
              <dt>
                <Text variant="body-xs-semibold" color="subtle">
                  {m.label}
                </Text>
              </dt>
              <dd>
                <Text variant="body-sm-normal">{m.value}</Text>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="user-banner__stats">
        <Stat value={profile.roles.length} label="Roles" />
        <Stat value={profile.teams.length} label="Teams" />
        <Stat value={profile.policies.length} label="Policies" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat">
      <Text variant="metric-sm" as="span">
        {String(value)}
      </Text>
      <Text variant="body-xs-normal" color="subtle">
        {label}
      </Text>
    </div>
  );
}

export default App;
