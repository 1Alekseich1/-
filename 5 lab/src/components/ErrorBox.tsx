import { Button } from './Button';
interface ErrorBoxProps { message: string; onRetry: () => void; }
export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return <section className="info-panel" role="alert"><h2>Не удалось загрузить</h2><p>{message}</p><Button onClick={onRetry}>Повторить</Button></section>;
}
