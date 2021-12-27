import * as uuid from 'uuid'

import {makeDynamoClient, readTableName, putInTable} from '../../helpers/cdk/lambdas/dynamodb'
import {APIGatewayEventType, APIGatewayReturnType, makeResponse} from '../../helpers/cdk/lambdas/api-gateway'
import {parseJSONData} from '../../helpers/cdk/lambdas/rest-api'

export async function handler(event: APIGatewayEventType): APIGatewayReturnType {
    const item = parseJSONData(event.body)
    await putInTable(makeDynamoClient(), readTableName(), uuid.v4(), item)
    return makeResponse(200, item)

}