import { Text, Tag, Pill, EmptyState } from '@capra/core';
import { UserOutlined } from '@capra/icons';
import { SectionCard } from './SectionCard';
import type { AssignedRole } from '../types';

const ADMIN_ROLE_IDS = new Set(['admin', 'owner', 'org_admin']);

function isAdminRole(role: AssignedRole): boolean {
  return ADMIN_ROLE_IDS.has(role.id.toLowerCase());
}

export function RolesSection({ roles }: { roles: AssignedRole[] }) {
  return (
    <SectionCard
      icon={UserOutlined}
      title="Roles"
      count={roles.length}
      subtitle="Roles currently granting you access in Cribl."
    >
      {roles.length === 0 ? (
        <EmptyState
          illustration="EmptyFolder"
          title="No roles assigned"
          description="You do not have any roles assigned in this Cribl deployment."
        />
      ) : (
        <ul className="item-list">
          {roles.map((role) => (
            <li key={role.id} className="role-item">
              <div className="role-item__head">
                <Text variant="body-md-semibold">{role.title || role.id}</Text>
                {isAdminRole(role) && (
                  <Pill appearance="danger" variant="muted" inline>
                    Admin
                  </Pill>
                )}
              </div>
              {role.title && role.title !== role.id && (
                <Text variant="body-xs-normal" color="subtle">
                  {role.id}
                </Text>
              )}
              {role.description && (
                <Text variant="body-sm-normal" color="secondary">
                  {role.description}
                </Text>
              )}
              <div className="tag-row">
                {typeof role.policyCount === 'number' && (
                  <Tag color="blue">{`${role.policyCount} ${role.policyCount === 1 ? 'policy' : 'policies'}`}</Tag>
                )}
                {role.tags?.map((tag) => (
                  <Tag key={tag} color="default">
                    {tag}
                  </Tag>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
