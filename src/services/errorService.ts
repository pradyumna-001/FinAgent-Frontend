export function log(error: unknown, context?: string): void {
    if (context) {
        console.error(`[${context}]`, error);
    } else {
        console.error(error);
    }
}

export function handleAsyncError<T>(promise: Promise<T>): Promise<T | void> {
    return promise.catch((error) => {
        log(error, 'async');
    });
}
