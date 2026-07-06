import { Text, Tag, EmptyState } from '@capra/core';
import { GroupOutlined } from '@capra/icons';
import { SectionCard } from './SectionCard';
import type { Team } from '../types';

export function TeamsSection({ teams }: { teams: Team[] }) {
  return (
    <SectionCard
      icon={GroupOutlined}
      title="Teams"
      count={teams.length}
      subtitle="Teams you belong to and the roles they grant."
    >
      {teams.length === 0 ? (
        <EmptyState
          illustration="MissingSock"
          title="No teams"
          description="You are not a member of any team, or team membership is managed outside this deployment."
        />
      ) : (
        <ul className="item-list">
          {teams.map((team) => (
            <li key={team.id} className="team-item">
              <Text variant="body-md-semibold">{team.name || team.id}</Text>
              {team.description && (
                <Text variant="body-sm-normal" color="secondary">
                  {team.description}
                </Text>
              )}
              {team.roles && team.roles.length > 0 && (
                <div className="tag-row">
                  {team.roles.map((role) => (
                    <Tag key={role} color="criblTeal">
                      {role}
                    </Tag>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
