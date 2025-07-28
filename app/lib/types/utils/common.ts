export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type EventHandler<T = void> = (data: T) => void;
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;
export interface AsyncResult<T, E = string> {
  data?: T;
  error?: E;
  loading: boolean;
}
