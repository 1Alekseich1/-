import { useEffect, useState } from 'react';
import type { LoadStatus } from '../../types';
import { errorMessage } from '../../api/client';
interface RemoteState<T> { status: LoadStatus; data: T | null; error: string; }
export function useFetch<T>(loader: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]): RemoteState<T> {
  const [state, setState] = useState<RemoteState<T>>({ status: 'loading', data: null, error: '' });
  // loader передаётся мемоизированной через useCallback; cleanup прерывает устаревшие запросы.
  useEffect(() => { const controller = new AbortController();
    let active = true;
    void (async () => { try {
      const data = await loader(controller.signal);
      if (active) setState({ status: 'success', data, error: '' });
    } catch (error: unknown) { if (active && !controller.signal.aborted) setState({ status: 'error', data: null, error: errorMessage(error) }); }
    })();
    return () => { active = false; controller.abort(); };
  // deps is supplied by the calling hook so a network request is rerun only for its query key.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
