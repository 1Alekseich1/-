interface BadgeProps { children: string; tone?: 'positive' | 'neutral'; }
export function Badge({ children, tone = 'neutral' }: BadgeProps) { return <span className={`badge badge--${tone}`}>{children}</span>; }
