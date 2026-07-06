import { useMemo, useState } from 'react';
import { Text, Tag, TextField, EmptyState } from '@capra/core';
import { SearchOutlined, SecurityScan } from '@capra/icons';
import { SectionCard } from './SectionCard';
import type { AuthPolicyEntry } from '../types';

function actionColor(action: string): 'green' | 'blue' | 'red' | 'amber' | 'purple' | 'default' {
  const a = action.toLowerCase();
  if (a === '*') return 'purple';
  if (a === 'get' || a === 'read' || a === 'list') return 'green';
  if (a === 'post' || a === 'create') return 'blue';
  if (a === 'patch' || a === 'put' || a === 'update') return 'amber';
  if (a === 'delete') return 'red';
  return 'default';
}

export function PoliciesSection({ policies }: { policies: AuthPolicyEntry[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter(
      (p) =>
        p.object.toLowerCase().includes(q) ||
        p.actions.some((a) => a.toLowerCase().includes(q)),
    );
  }, [policies, query]);

  return (
    <SectionCard
      icon={SecurityScan}
      title="Policies"
      count={policies.length}
      subtitle="Your effective authorization policy: what you can do on each object."
    >
      {policies.length === 0 ? (
        <EmptyState
          illustration="EmptyFolder"
          title="No policies"
          description="No authorization policy entries were returned for your account."
        />
      ) : (
        <>
          <div className="policy-search">
            <TextField
              aria-label="Filter policies"
              placeholder="Filter by object or action…"
              value={query}
              onChange={setQuery}
              leadingSlot={<SearchOutlined />}
            />
          </div>
          {filtered.length === 0 ? (
            <Text variant="body-sm-normal" color="subtle">
              No policies match “{query}”.
            </Text>
          ) : (
            <ul className="item-list policy-list">
              {filtered.map((entry, i) => (
                <li key={`${entry.object}-${i}`} className="policy-item">
                  <span className="policy-object">
                    <Text as="code" variant="code">
                      {entry.object}
                    </Text>
                  </span>
                  <div className="tag-row">
                    {entry.actions.map((action) => (
                      <Tag key={action} color={actionColor(action)}>
                        {action === '*' ? 'all actions' : action}
                      </Tag>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </SectionCard>
  );
}
