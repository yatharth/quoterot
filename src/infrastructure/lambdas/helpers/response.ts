import {jsonStringifyPretty} from '../../../helpers/stringify'

// Create suitable response for lambdas to return.
//
// It isn’t always important what a lambda returns, but it is used by:
// - API Gateway to return a response to the client
// - I think SQS to see if processing the records worked? (not sure)
//
export function makeResponse(statusCode: number, body: any) {
    return {
        statusCode,
        body: jsonStringifyPretty(body),
    }
}

