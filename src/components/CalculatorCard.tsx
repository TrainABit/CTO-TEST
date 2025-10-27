import { ReactNode } from 'react';
import { Tooltip } from './Tooltip';

type GuidanceLink = {
  href: string;
  label: string;
};

type CalculatorCardProps = {
  title: string;
  description: string;
  tooltipContent?: ReactNode;
  guidanceLink?: GuidanceLink;
  children: ReactNode;
};

export function CalculatorCard({
  title,
  description,
  tooltipContent,
  guidanceLink,
  children,
}: CalculatorCardProps) {
  return (
    <section className="calculator-card">
      <header className="calculator-card__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="calculator-card__meta">
          {tooltipContent ? <Tooltip content={tooltipContent} label={`Guidance for ${title}`} /> : null}
          {guidanceLink ? (
            <a className="calculator-card__link" href={guidanceLink.href}>
              {guidanceLink.label}
            </a>
          ) : null}
        </div>
      </header>
      <div className="calculator-card__body">{children}</div>
    </section>
  );
}
