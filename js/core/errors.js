export class HttpError extends Error {
    status;
    constructor(status, statusText = '') {
        super(`HTTP ${status} ${statusText}`.trim());
        this.name = 'HttpError';
        this.status = status;
    }
}
const hasErrorName = (error, name) => error instanceof Error && error.name === name;
export const isAbortError = (error) => hasErrorName(error, 'AbortError');
export const isTimeoutError = (error) => hasErrorName(error, 'TimeoutError');
export const classifyError = (error) => {
    if (isAbortError(error))
        return { kind: 'aborted' };
    if (isTimeoutError(error))
        return { kind: 'timeout' };
    if (error instanceof HttpError)
        return { kind: 'http', status: error.status };
    if (error instanceof TypeError)
        return { kind: 'network' };
    return { kind: 'unknown' };
};
//# sourceMappingURL=errors.js.map