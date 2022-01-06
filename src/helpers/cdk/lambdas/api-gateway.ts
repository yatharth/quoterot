import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'

import {jsonStringifyPretty} from '../../javascript/stringify'


// Alias of the types for lambdas invoked by API Gateway.
// It’s nice to alias them, to not get confused by similar-sounding types like APIGatewayProxyEventV2, etc.
//
//     export async function handler(event: APIGatewayEventType): APIGatewayReturnType {
//         ...
//     }
//
export type APIGatewayEventType = APIGatewayProxyEvent
export type APIGatewayReturnType = APIGatewayProxyResult


// Create suitable response for lambdas to return to API Gateway.
export function makeResponse(statusCode: number, body: any): APIGatewayReturnType {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonStringifyPretty(body),
    }
}

// Log to console and make a response in one go.
// Something I very often do, so made a convenience function.
export function logAndMakeResponse(statusCode: number, body: any): APIGatewayReturnType {
    console.log(jsonStringifyPretty(body))
    return makeResponse(statusCode, body)
}