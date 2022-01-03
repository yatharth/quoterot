import {resolve} from 'app-root-path'

import {Construct, NestedStack} from '@aws-cdk/core'

import {addLambdaToEndpoint, makeRestApi} from '../helpers/cdk/stack/api-gateway'
import {makeLambda} from '../helpers/cdk/stack/lambda'
import {pathRelativeTo} from '../helpers/javascript/path'
import {DynamoDbTable} from '../helpers/cdk/stack/dynamodb'


export class TestStack extends NestedStack {
    constructor(scope: Construct) {

        super(scope, 'TestStack')

        const api = makeRestApi(this, 'testStackApi')

        const testTable = new DynamoDbTable(this, {
            id: 'testTable',
            tableNameEnvVar: 'TABLE_NAME',
            partitionKey: 'id'
        })

        const lambdasDir = resolve('src/test-stack/lambdas/')
        const pathToLambda = pathRelativeTo(lambdasDir)

        const getTable = makeLambda(this, 'getTable', pathToLambda('get-table.ts'), {})
        const postTable = makeLambda(this, 'postTable', pathToLambda('post-table.ts'), {})

        addLambdaToEndpoint(api, api.root, ['GET'], getTable, true)
        addLambdaToEndpoint(api, api.root, ['POST'], postTable, true)

        testTable.connectLambda(getTable)
        testTable.connectLambda(postTable)

    }
}