import {APIGatewayReturnType, makeResponse} from '../../helpers/cdk/lambdas/api-gateway'
import {fetchAllItems, makeDynamoClient} from '../../helpers/cdk/lambdas/dynamodb'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'


export async function handler(): APIGatewayReturnType {
    const items = await fetchAllItems(makeDynamoClient(), readFromEnv('TABLE_NAME'))
    return makeResponse(200, items)
}

