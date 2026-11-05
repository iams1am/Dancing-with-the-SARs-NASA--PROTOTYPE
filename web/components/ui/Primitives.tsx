"use client";

import Link from "next/link";
import { Fragment, cloneElement, isValidElement, useId, useRef } from "react";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  HTMLAttributes,
  KeyboardEvent,
  ReactElement,
  ReactNode
} from "react";
import { IconAlertTriangle, IconInbox, IconInfo } from "./Icons";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

/* Buttons ---------------------------------------------------------- */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

function buttonClassName({
  variant = "secondary",
  size = "md",
  fullWidth,
  className
}: ButtonStyleProps & { className?: string }) {
  return cx(
    "tc-button",
    `tc-button-${variant}`,
    `tc-button-${size}`,
    fullWidth && "tc-button-full",
    className
  );
}

export type ButtonProps = ButtonStyleProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  isLoading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <span className="tc-spinner" aria-hidden="true" />
      ) : leadingIcon ? (
        <span className="tc-button-icon" aria-hidden="true">{leadingIcon}</span>
      ) : null}
      <span className="tc-button-label">{children}</span>
      {!isLoading && trailingIcon ? (
        <span className="tc-button-icon" aria-hidden="true">{trailingIcon}</span>
      ) : null}
    </button>
  );
}

export type ButtonLinkProps = ButtonStyleProps &
  Omit<ComponentProps<typeof Link>, "className"> & {
    className?: string;
  };

export function ButtonLink({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={buttonClassName({ variant, size, fullWidth, className })}
    >
      {leadingIcon ? (
        <span className="tc-button-icon" aria-hidden="true">{leadingIcon}</span>
      ) : null}
      <span className="tc-button-label">{children}</span>
      {trailingIcon ? (
        <span className="tc-button-icon" aria-hidden="true">{trailingIcon}</span>
      ) : null}
    </Link>
  );
}

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  label: string;
  variant?: "default" | "ghost";
  size?: ButtonSize;
  children: ReactNode;
};

export function IconButton({
  label,
  variant = "default",
  size = "md",
  className,
  children,
  title,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cx(
        "tc-icon-button",
        variant === "ghost" && "tc-icon-button-ghost",
        size === "sm" && "tc-icon-button-sm",
        size === "lg" && "tc-icon-button-lg",
        className
      )}
      aria-label={label}
      title={title ?? label}
    >
      {children}
    </button>
  );
}

/* Surfaces and headings -------------------------------------------- */

type PanelElement = "section" | "div" | "aside" | "article";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: PanelElement;
  variant?: "default" | "raised" | "flush";
  padding?: "none" | "sm" | "md" | "lg";
};

export function Panel({
  as: Tag = "section",
  variant = "default",
  padding = "none",
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <Tag
      {...props}
      className={cx(
        "tc-panel",
        variant !== "default" && `tc-panel-${variant}`,
        `tc-panel-pad-${padding}`,
        className
      )}
    >
      {children}
    </Tag>
  );
}

type HeadingTag = "h2" | "h3" | "h4" | "div";

export type PanelHeaderProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleAs?: HeadingTag;
  titleId?: string;
  className?: string;
};

export function PanelHeader({
  title,
  eyebrow,
  description,
  actions,
  titleAs: Title = "h2",
  titleId,
  className
}: PanelHeaderProps) {
  return (
    <div className={cx("tc-panel-header", className)}>
      <div className="tc-panel-heading">
        {eyebrow ? <div className="tc-eyebrow">{eyebrow}</div> : null}
        <Title className="tc-panel-title" id={titleId}>{title}</Title>
        {description ? <p className="tc-panel-description">{description}</p> : null}
      </div>
      {actions ? <div className="tc-panel-actions">{actions}</div> : null}
    </div>
  );
}

export type SectionHeaderProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleAs?: HeadingTag;
  titleId?: string;
  className?: string;
};

export function SectionHeader({
  title,
  eyebrow,
  description,
  actions,
  titleAs: Title = "h2",
  titleId,
  className
}: SectionHeaderProps) {
  return (
    <div className={cx("tc-section-header", className)}>
      <div className="tc-section-heading">
        {eyebrow ? <div className="tc-eyebrow">{eyebrow}</div> : null}
        <Title className="tc-section-title" id={titleId}>{title}</Title>
        {description ? (
          <p className="tc-section-description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="tc-section-actions">{actions}</div> : null}
    </div>
  );
}

export function MetadataLabel({
  children,
  as: Tag = "span",
  className
}: {
  children: ReactNode;
  as?: "span" | "div";
  className?: string;
}) {
  return <Tag className={cx("tc-metadata-label", className)}>{children}</Tag>;
}

/* Data display ----------------------------------------------------- */

export type DataRowProps = {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  note?: ReactNode;
  mono?: boolean;
  className?: string;
};

export function DataRow({
  label,
  value,
  unit,
  note,
  mono = false,
  className
}: DataRowProps) {
  return (
    <div className={cx("tc-data-row", mono && "tc-data-row-mono", className)}>
      <div className="tc-data-row-main">
        <span className="tc-data-row-label">{label}</span>
        <span className="tc-data-row-value">
          {value}
          {unit ? <span className="tc-data-row-unit">{unit}</span> : null}
        </span>
      </div>
      {note ? <p className="tc-data-row-note">{note}</p> : null}
    </div>
  );
}

export type MetricTone =
  | "neutral"
  | "accent"
  | "warning"
  | "error"
  | "success";

export type MetricReadoutProps = {
  label: ReactNode;
  value: ReactNode;
  unit?: string;
  description?: ReactNode;
  tone?: MetricTone;
  className?: string;
};

export function MetricReadout({
  label,
  value,
  unit,
  description,
  tone = "neutral",
  className
}: MetricReadoutProps) {
  return (
    <div
      className={cx(
        "tc-metric",
        tone !== "neutral" && `tc-metric-${tone}`,
        className
      )}
    >
      <MetadataLabel>{label}</MetadataLabel>
      <p className="tc-metric-value">
        {value}
        {unit ? <span className="tc-metric-unit">{unit}</span> : null}
      </p>
      {description ? (
        <p className="tc-metric-description">{description}</p>
      ) : null}
    </div>
  );
}

/* Evidence --------------------------------------------------------- */

export const EVIDENCE_LABELS = {
  observed: "Observed",
  derived: "Derived",
  contextual: "Contextual",
  potential: "Potential"
} as const;

export type EvidenceKind = keyof typeof EVIDENCE_LABELS;

export function EvidenceLabel({
  kind,
  label,
  className
}: {
  kind: EvidenceKind;
  label?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx("tc-evidence-label", `tc-evidence-${kind}`, className)}
      data-evidence={kind}
    >
      <span className="tc-evidence-dot" aria-hidden="true" />
      {label ?? EVIDENCE_LABELS[kind]}
    </span>
  );
}

/* Notices ---------------------------------------------------------- */

export type NoticeTone = "info" | "warning" | "limitation";

export function ScientificNotice({
  tone = "info",
  title,
  children,
  className
}: {
  tone?: NoticeTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const NoticeIcon = tone === "info" ? IconInfo : IconAlertTriangle;

  return (
    <div
      className={cx("tc-notice", `tc-notice-${tone}`, className)}
      role="note"
    >
      <span className="tc-notice-icon" aria-hidden="true">
        <NoticeIcon size={18} />
      </span>
      <div className="tc-notice-body">
        {title ? <p className="tc-notice-title">{title}</p> : null}
        <div className="tc-notice-copy">{children}</div>
      </div>
    </div>
  );
}

/* Legends ---------------------------------------------------------- */

export type LegendItem = {
  id?: string;
  label: ReactNode;
  evidence?: EvidenceKind;
  color?: string;
  description?: ReactNode;
};

export function DataLegend({
  items,
  label = "Legend",
  className
}: {
  items: readonly LegendItem[];
  label?: string;
  className?: string;
}) {
  return (
    <div className={cx("tc-legend", className)}>
      <span className="tc-legend-title">{label}</span>
      <ul className="tc-legend-items">
        {items.map((item, index) => (
          <li className="tc-legend-item" key={item.id ?? index}>
            <span
              className={cx(
                "tc-legend-swatch",
                item.evidence && `tc-legend-swatch-${item.evidence}`
              )}
              style={item.color ? { backgroundColor: item.color } : undefined}
              aria-hidden="true"
            />
            <span className="tc-legend-item-label">{item.label}</span>
            {item.description ? (
              <span className="tc-legend-description">{item.description}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Segmented control ------------------------------------------------ */

export type SegmentedOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
};

export function SegmentedControl({
  label,
  value,
  options,
  onChange,
  size = "md",
  className
}: {
  label: string;
  value: string;
  options: readonly SegmentedOption[];
  onChange: (value: string) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "tc-segmented",
        size === "sm" && "tc-segmented-sm",
        className
      )}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="tc-segment"
          aria-label={option.ariaLabel}
          aria-pressed={value === option.value}
          disabled={option.disabled}
          title={option.title}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* Tabs ------------------------------------------------------------- */

export type TabItem = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  title?: string;
};

/** Stable id pair so a tab and its panel can reference each other. */
export function tabIds(idBase: string, value: string) {
  return {
    tabId: `${idBase}-tab-${value}`,
    panelId: `${idBase}-panel-${value}`
  };
}

export function TabGroup({
  label,
  value,
  items,
  onChange,
  size = "md",
  idBase,
  className
}: {
  label: string;
  value: string;
  items: readonly TabItem[];
  onChange: (value: string) => void;
  size?: "sm" | "md";
  idBase?: string;
  className?: string;
}) {
  const generatedId = useId();
  const base = idBase ?? generatedId;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const enabled = items.filter((item) => !item.disabled);

  function selectIndex(index: number) {
    const next = enabled[index];
    if (!next) return;
    onChange(next.value);
    tabRefs.current[items.indexOf(next)]?.focus();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    item: TabItem
  ) {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key) || enabled.length === 0) return;

    event.preventDefault();
    const currentIndex = enabled.findIndex(
      (candidate) => candidate.value === item.value
    );
    if (currentIndex < 0) return;

    if (event.key === "Home") return selectIndex(0);
    if (event.key === "End") return selectIndex(enabled.length - 1);
    if (event.key === "ArrowRight") {
      return selectIndex((currentIndex + 1) % enabled.length);
    }
    return selectIndex((currentIndex - 1 + enabled.length) % enabled.length);
  }

  return (
    <div
      className={cx(
        "tc-tabgroup",
        size === "sm" && "tc-tabgroup-sm",
        className
      )}
      role="tablist"
      aria-label={label}
    >
      {items.map((item) => {
        const selected = item.value === value;
        const ids = tabIds(base, item.value);

        return (
          <button
            key={item.value}
            ref={(node) => {
              tabRefs.current[items.indexOf(item)] = node;
            }}
            type="button"
            role="tab"
            id={ids.tabId}
            className="tc-tab"
            aria-selected={selected}
            aria-controls={ids.panelId}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            title={item.title}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, item)}
          >
            {item.icon ? (
              <span className="tc-tab-icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* Tooltip ---------------------------------------------------------- */

export function Tooltip({
  label,
  children,
  side = "top",
  focusable = false,
  className
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  focusable?: boolean;
  className?: string;
}) {
  const id = useId();
  const child = children as ReactElement<{ "aria-describedby"?: string }>;
  const childIsElement =
    isValidElement<{ "aria-describedby"?: string }>(children) &&
    children.type !== Fragment;
  const trigger = childIsElement
    ? cloneElement(child, {
        "aria-describedby": cx(child.props["aria-describedby"], id)
      })
    : children;

  return (
    <span className={cx("tc-tooltip", `tc-tooltip-${side}`, className)}>
      <span
        className="tc-tooltip-trigger"
        tabIndex={!childIsElement && focusable ? 0 : undefined}
        aria-describedby={!childIsElement ? id : undefined}
      >
        {trigger}
      </span>
      <span className="tc-tooltip-bubble" id={id} role="tooltip">
        {label}
      </span>
    </span>
  );
}

/* States ----------------------------------------------------------- */

export function Skeleton({
  lines = 1,
  className
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cx("tc-skeleton", className)} aria-hidden="true">
      {Array.from({ length: Math.max(1, lines) }, (_, index) => (
        <span className="tc-skeleton-line" key={index} />
      ))}
    </div>
  );
}

export function LoadingState({
  title = "Loading",
  description,
  compact = false,
  className
}: {
  title?: ReactNode;
  description?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "tc-state",
        "tc-state-loading",
        compact && "tc-state-compact",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="tc-spinner" aria-hidden="true" />
      <div className="tc-state-body">
        <p className="tc-state-title">{title}</p>
        {description ? <p className="tc-state-copy">{description}</p> : null}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  retryLabel = "Try again",
  onRetry,
  compact = false,
  className
}: {
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "tc-state",
        "tc-state-error",
        compact && "tc-state-compact",
        className
      )}
      role="alert"
    >
      <span className="tc-state-icon" aria-hidden="true">
        <IconAlertTriangle size={18} />
      </span>
      <div className="tc-state-body">
        <p className="tc-state-title">{title}</p>
        {description ? <p className="tc-state-copy">{description}</p> : null}
        {onRetry ? (
          <div className="tc-state-actions">
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title = "Nothing to show yet",
  description,
  action,
  compact = false,
  className
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "tc-state",
        "tc-state-empty",
        compact && "tc-state-compact",
        className
      )}
    >
      <span className="tc-state-icon" aria-hidden="true">
        <IconInbox size={18} />
      </span>
      <div className="tc-state-body">
        <p className="tc-state-title">{title}</p>
        {description ? <p className="tc-state-copy">{description}</p> : null}
        {action ? <div className="tc-state-actions">{action}</div> : null}
      </div>
    </div>
  );
}
