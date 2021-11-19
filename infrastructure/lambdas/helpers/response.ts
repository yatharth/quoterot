export function makeResponse(statusCode: number, body: any) {
    return {
        statusCode,
        body: JSON.stringify(body)
    };
}
