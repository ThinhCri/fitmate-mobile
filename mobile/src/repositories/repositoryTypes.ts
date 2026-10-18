/**
 * Repository and Data Port core types
 */

export type AsyncData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'offline'; cached?: T }
  | { status: 'forbidden' }
  | { status: 'session-expired' }
  | { status: 'error'; message: string; retryable: boolean };
