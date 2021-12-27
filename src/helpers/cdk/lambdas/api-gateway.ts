import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda'

import {jsonStringifyPretty} from '../../javascript/stringify'


// Alias useful types for lambdas invoked by API Gateway.
//
//     export async function handler(event: APIGatewayEventType): APIGatewayReturnType {
//         ...
//     }
//
export type APIGatewayEventType = APIGatewayProxyEventV2
export type APIGatewayReturnType = Promise<APIGatewayProxyResultV2>


// Create suitable response for lambdas to return to API Gateway.
export function makeResponse(statusCode: number, body: any) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonStringifyPretty(body),
    }
}