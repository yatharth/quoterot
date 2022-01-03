import {webhookHandler} from '../webhook/webhook'
import {APIGatewayEventType, APIGatewayReturnType, makeResponse} from '../../helpers/cdk/lambdas/api-gateway'
import {parseJSONData, parseQueryString} from '../../helpers/cdk/lambdas/rest-api'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'


export async function handler(event: APIGatewayEventType): APIGatewayReturnType {

    const method = event.requestContext.http.method
    const query = parseQueryString(event.rawQueryString)
    const body = parseJSONData(event.body)

    const consumerSecret = readFromEnv('TWITTER_CONSUMER_SECRET')
    if (!consumerSecret)
        throw "No consumer secret supplied in environment."

    const response = await webhookHandler(method, query, body, consumerSecret)

    return makeResponse(200, response)

}