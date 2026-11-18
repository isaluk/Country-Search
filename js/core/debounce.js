export const debounce = (fn, delay) => {
    let timerId;
    const cancel = () => {
        clearTimeout(timerId);
        timerId = undefined;
    };
    const debounced = (...args) => {
        cancel();
        timerId = setTimeout(() => {
            timerId = undefined;
            fn(...args);
        }, delay);
    };
    return Object.assign(debounced, { cancel });
};
//# sourceMappingURL=debounce.js.map