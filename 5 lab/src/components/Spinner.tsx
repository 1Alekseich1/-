interface SpinnerProps { label?: string; }
export function Spinner({ label = 'Загружаем книги…' }: SpinnerProps) { return <p className="spinner" role="status" aria-live="polite">⏳ {label}</p>; }
