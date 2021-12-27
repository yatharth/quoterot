// Stringify without whitespace.
export function jsonStringifyCompact(object: any) {
    return JSON.stringify(object)
}

// Stringify with whitespace.
export function jsonStringifyPretty(object: any, spaces: number = 2) {
    return JSON.stringify(object, null, spaces)
}
