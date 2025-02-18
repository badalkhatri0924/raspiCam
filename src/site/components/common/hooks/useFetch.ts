import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { ActionTypes, createActions } from '../actionHelper';
import { useDebounce } from './useDebounce';
import { useTimer } from './useTimer';

export interface FetchState<T> {
  data: T;
  isLoading: boolean;
  isUpdating: boolean;
  input?: Partial<T>;
}

/**
 * Create fetch and update reducer with typed actions
 * @template T Type of request data
 */
const createFetchSlice = <T>() => {
  const actions = createActions({
    FETCH: () => undefined,
    FETCH_SUCCESS: (data: T) => data,
    FETCH_FAILURE: (error: Error) => error,
    UPDATE: (data: Partial<T>) => data,
    UPDATE_SUCCESS: (data: T) => data,
    UPDATE_FAILURE: (error: Error) => error,
    USER_INPUT: (data: Partial<T>) => data,
  });

  type FetchActions = ActionTypes<typeof actions>;

  const reducer = (state: FetchState<T>, action: FetchActions) => {
    // TODO handle failure
    switch (action.type) {
      case 'FETCH':
        return { ...state, isLoading: true };
      case 'FETCH_SUCCESS':
        return { ...state, data: action.payload, isLoading: false };
      case 'UPDATE':
        return {
          ...state,
          data: { ...state.data, ...state.input },
          input: undefined,
          isUpdating: true,
        };
      case 'UPDATE_SUCCESS':
        return {
          ...state,
          data: action.payload,
          isUpdating: false,
        };
      case 'USER_INPUT':
        return {
          ...state,
          input: { ...state.input, ...action.payload },
          isUpdating: true,
        };
      default:
        return state;
    }
  };

  return { reducer, actions };
};

/**
 * Fetch and post data
 *
 * @template T type of the response
 * @param url url to fetch
 * @param data default data
 * @param [refreshInterval] refresh intervall in ms
 */
export const useFetch = <T>(
  url: RequestInfo,
  data: T,
  refreshInterval = 5000,
  updateDebounce = 300,
): [FetchState<T>, (data: T) => void, () => void] => {
  // Create and initialize reducer and actions
  const { reducer, actions } = useMemo(() => createFetchSlice<T>(), []);
  const [state, dispatch] = useReducer(reducer, { isLoading: true, isUpdating: false, data });

  // Abort controller to cancel the fetch and update
  const abortFetch = useRef(new AbortController());
  const abortUpdate = useRef(new AbortController());

  // Fetch data callback
  const fetchData = useCallback(() => {
    abortFetch.current = new AbortController();
    dispatch(actions.FETCH());

    fetch(url, { signal: abortFetch.current.signal })
      .then((res) => res.json())
      .then((json: T) => dispatch(actions.FETCH_SUCCESS(json)))
      .catch((error: Error) => {
        if (!abortFetch.current.signal.aborted) {
          dispatch(actions.FETCH_FAILURE(error));
        }
      });
  }, [url, actions]);

  // Refresh timer
  const [startRefresh, stopRefresh] = useTimer(fetchData, refreshInterval);

  // Post the user input
  const postData = useCallback(
    (data: T) => {
      abortUpdate.current = new AbortController();
      dispatch(actions.UPDATE(data));

      // Post the updated data
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: abortUpdate.current.signal,
      })
        .then((res) => res.json())
        .then((json: T) => dispatch(actions.UPDATE_SUCCESS(json)))
        .finally(startRefresh)
        .catch((error: Error) => {
          if (!abortUpdate.current.signal.aborted) {
            dispatch(actions.UPDATE_FAILURE(error));
          }
        });
    },
    [url, actions, startRefresh],
  );

  // Debounce the update
  const [updateDebounced] = useDebounce(postData, updateDebounce);

  // Update the user input
  const update = (newInput: T) => {
    stopRefresh();
    abortFetch.current.abort();
    abortUpdate.current.abort();
    dispatch(actions.USER_INPUT(newInput));
    updateDebounced({ ...state.data, ...state.input, ...newInput });
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
    startRefresh();

    // Abort fetch on unload
    return () => {
      abortUpdate.current.abort();
      abortFetch.current.abort();
    };
  }, [fetchData, startRefresh]);

  return [state, update, fetchData];
};
