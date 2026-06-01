
export function isNullOrEmpty(str: string | null): boolean {
    return str === null || str.trim() === '';
}

export function isNullOrUndefinedOrEmpty(str: string | undefined | null): boolean {
    return str === undefined || str === null || str.trim() === '';
}