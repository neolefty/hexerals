/**
 * Convert to Error if necessary.
 * Useful in catch() where you _think_ it is an Error but TypeScript can't be sure.
 */
export const unknownToError = (u: unknown): Error =>
    (u instanceof Error) ? u : new Error(JSON.stringify(u))
