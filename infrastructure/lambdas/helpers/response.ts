// Create response suitable for lambdas.
export function makeResponse(statusCode: number, body: any) {
    return {
        statusCode,
        body: JSON.stringify(body)
    };
}

// Stringify object with whitespace.
export function jsonStringify(object: any, spaces: number = 2) {
    return JSON.stringify(object, null, spaces)
}
