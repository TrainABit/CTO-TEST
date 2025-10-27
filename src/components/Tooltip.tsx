import { ReactNode, useId, useState } from 'react';

type TooltipProps = {
  content: ReactNode;
  label?: string;
};

export function Tooltip({ content, label = 'More info' }: TooltipProps) {
  const tooltipId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tooltip"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setVisible((current) => !current);
        }
      }}
      role="button"
      tabIndex={0}
      aria-describedby={tooltipId}
    >
      <span className="tooltip__icon" aria-hidden="true">
        ⓘ
      </span>
      <span id={tooltipId} role="tooltip" className={`tooltip__content${visible ? ' tooltip__content--visible' : ''}`}>
        {content}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
