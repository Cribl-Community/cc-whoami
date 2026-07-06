import type { ReactNode } from 'react';
import { Card, Text, Pill } from '@capra/core';
import type { SvgIcon } from '@capra/icons';

interface SectionCardProps {
  icon: SvgIcon;
  title: string;
  count?: number;
  subtitle?: string;
  children: ReactNode;
}

export function SectionCard({ icon: Icon, title, count, subtitle, children }: SectionCardProps) {
  return (
    <Card className="section-card">
      <div className="section-card__header">
        <div className="section-card__heading">
          <span className="section-card__icon">
            <Icon />
          </span>
          <Text variant="heading-sm" as="h2">
            {title}
          </Text>
          {typeof count === 'number' && (
            <Pill appearance="highlight" variant="muted" inline>
              {String(count)}
            </Pill>
          )}
        </div>
        {subtitle && (
          <Text variant="body-sm-normal" color="secondary">
            {subtitle}
          </Text>
        )}
      </div>
      <div className="section-card__content">{children}</div>
    </Card>
  );
}
