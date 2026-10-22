import type { ReactNode } from 'react';
interface ButtonProps { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' | 'reset'; variant?: 'primary' | 'secondary'; pressed?: boolean; }
export function Button({ children, onClick, disabled = false, type = 'button', variant = 'primary', pressed }: ButtonProps) {
  return <button type={type} className={variant === 'secondary' ? 'button--secondary' : undefined} onClick={onClick} disabled={disabled} aria-pressed={pressed}>{children}</button>;
}
