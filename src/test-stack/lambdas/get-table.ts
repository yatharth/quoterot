import {APIGatewayReturnType, makeResponse} from '../../helpers/cdk/lambdas/api-gateway'
import {fetchAllItems, makeDynamoClient, readTableName} from '../../helpers/cdk/lambdas/dynamodb'


export async function handler(): APIGatewayReturnType {
    const items = await fetchAllItems(makeDynamoClient(), readTableName())
    return makeResponse(200, items)
}

