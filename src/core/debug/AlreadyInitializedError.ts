
export class AlreadyInitializedError extends Error {
    constructor(className: string, extraMessage?: string) {
        super(`${className} is already initialized! ${extraMessage ?? ""}`);
    }
}