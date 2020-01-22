
export class NotInitializedError extends Error {
    constructor(className: string, extraMessage?: string) {
        super(`${className} is not initialized! ${extraMessage ?? ""}`);
    }
}