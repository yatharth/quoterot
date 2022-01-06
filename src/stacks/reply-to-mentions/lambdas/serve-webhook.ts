// This lambda is a wrapper for our Twitter webhook, which is defined in `webhook/`.
//
// It’s defined there in an environment-agnostic way that doesn’t depend on being run
//  on AWS, by an Express server locally, or anything.
//
// This lambda is just an adapter.

import {webhookHandler} from '../webhook/webhook'
import {APIGatewayEventType, APIGatewayReturnType, makeResponse} from '../../../helpers/cdk/lambdas/api-gateway'
import {parseJSONData, QueryParameters} from '../../../helpers/cdk/lambdas/rest-api'
import {readFromEnv} from '../../../helpers/cdk/lambdas/secrets'


export async function handler(event: APIGatewayEventType): Promise<APIGatewayReturnType> {

    const method = event.httpMethod
    const query: QueryParameters = event.queryStringParameters || {}
    const body = parseJSONData(event.body)

    const consumerSecret = readFromEnv('TWITTER_CONSUMER_SECRET')
    if (!consumerSecret)
        throw "No consumer secret supplied in environment."

    const response = await webhookHandler(method, query, body, consumerSecret)

    return makeResponse(200, response)

}