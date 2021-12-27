import {resolve} from 'app-root-path'

import {App, Stack} from '@aws-cdk/core'

import {addLambdaToEndpoint, makeRestApi} from '../helpers/cdk/stack/api-gateway'
import {makeLambda} from '../helpers/cdk/stack/lambda'
import {connectLambdaToTable, makeTable} from '../helpers/cdk/stack/dynamodb'
import {pathRelativeTo} from '../helpers/javascript/path'


export class TestStack extends Stack {
    constructor(app: App) {

        super(app, 'TestStack')

        const api = makeRestApi(this, 'testStackApi')

        const testTable = makeTable(this, 'testTable', 'id')

        const lambdasDir = resolve('src/test-stack/lambdas/')
        const pathToLambda = pathRelativeTo(lambdasDir)

        const getTable = makeLambda(this, 'getTable', pathToLambda('get-table.ts'), {})
        const postTable = makeLambda(this, 'postTable', pathToLambda('post-table.ts'), {})

        addLambdaToEndpoint(api, api.root, ['GET'], getTable, true)
        addLambdaToEndpoint(api, api.root, ['POST'], postTable, true)

        connectLambdaToTable(getTable, testTable)
        connectLambdaToTable(postTable, testTable)

    }
}