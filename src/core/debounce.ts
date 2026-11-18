export interface Debounced<Args extends unknown[]> {
  (...args: Args): void;
  cancel: () => void;
}

export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): Debounced<Args> => {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => {
    clearTimeout(timerId);
    timerId = undefined;
  };

  const debounced = (...args: Args) => {
    cancel();
    timerId = setTimeout(() => {
      timerId = undefined;
      fn(...args);
    }, delay);
  };

  return Object.assign(debounced, { cancel });
};
