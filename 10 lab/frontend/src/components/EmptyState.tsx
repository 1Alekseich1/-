import { Button } from './Button';
interface EmptyStateProps { title: string; description: string; onReset?: () => void; }
export function EmptyState({ title, description, onReset }: EmptyStateProps) {
  return <section className="info-panel"><h2>{title}</h2><p>{description}</p>{onReset && <Button variant="secondary" onClick={onReset}>Сбросить фильтры</Button>}</section>;
}
