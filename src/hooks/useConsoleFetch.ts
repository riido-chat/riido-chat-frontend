import { useEffect, useState } from 'react';

import { toConsoleApiError, type ConsoleApiError } from '@/api/console';

/** 조회의 진행 상태. 실패의 오류는 응답 오류 객체 그대로 두어 message 를 그대로 보일 수 있게 한다. */
export type ConsoleFetchState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'failed'; error: ConsoleApiError };

type ConsoleFetcher<T> = (signal: AbortSignal) => Promise<T>;

const LOADING_STATE = { status: 'loading' } as const;

/**
 * 콘솔 조회 엔드포인트를 부르고 조회 중, 성공, 실패를 한 상태로 돌려준다.
 * fetcher 가 바뀌면 새 대상을 조회 중으로 보이고, 재조회는 보고 있던 데이터를 유지한 채 응답이 오면 갈아 끼운다.
 * 재조회 실패는 이미 끝난 실행의 결과를 가리지 않도록 보고 있던 데이터를 그대로 둔다.
 * fetcher 는 useCallback 으로 감싸거나 모듈 수준 함수를 넘겨야 렌더마다 조회가 반복되지 않는다.
 */
export function useConsoleFetch<T>(fetcher: ConsoleFetcher<T>) {
  // 어느 fetcher 로 얻은 결과인지 함께 두어, fetcher 가 바뀌면 effect 가 돌기 전에도 조회 중으로 보인다.
  const [stored, setStored] = useState<{ fetcher: ConsoleFetcher<T>; state: ConsoleFetchState<T> }>(
    { fetcher, state: LOADING_STATE },
  );
  // 재조회와 다시 시도는 같은 조회를 반복하므로, 값을 올려 effect 를 다시 실행시킨다.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal)
      .then((data) => setStored({ fetcher, state: { status: 'ready', data } }))
      .catch((error: unknown) => {
        // 화면을 떠나거나 재조회가 겹쳐 중단한 요청은 실패가 아니므로 상태를 바꾸지 않는다.
        if (controller.signal.aborted) {
          return;
        }

        setStored((previous) =>
          previous.fetcher === fetcher && previous.state.status === 'ready'
            ? previous
            : { fetcher, state: { status: 'failed', error: toConsoleApiError(error) } },
        );
      });

    return () => controller.abort();
  }, [fetcher, attempt]);

  const state: ConsoleFetchState<T> = stored.fetcher === fetcher ? stored.state : LOADING_STATE;

  // 재조회는 화면을 조회 중으로 바꾸지 않고 응답이 오면 데이터만 갈아 끼운다.
  const refetch = () => setAttempt((count) => count + 1);

  // 다시 시도는 실패 화면을 조회 중으로 되돌린 뒤 같은 조회를 반복한다.
  const retry = () => {
    setStored({ fetcher, state: LOADING_STATE });
    refetch();
  };

  return { state, refetch, retry };
}
