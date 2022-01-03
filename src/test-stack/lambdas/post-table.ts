import {APIGatewayEventType, APIGatewayReturnType, makeResponse} from '../../helpers/cdk/lambdas/api-gateway'
import {makeDynamoClient, putInTable} from '../../helpers/cdk/lambdas/dynamodb'
import {parseJSONData} from '../../helpers/cdk/lambdas/rest-api'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'

export async function handler(event: APIGatewayEventType): APIGatewayReturnType {
    const item = parseJSONData(event.body)
    await putInTable(makeDynamoClient(), readFromEnv('TABLE_NAME'), item)
    return makeResponse(200, item)

}