import {Construct} from '@aws-cdk/core'
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb'
import {Function} from '@aws-cdk/aws-lambda'

import {getId} from './cdk'
import {makeCfnOutput} from './cfn'
import {ENVIRONMENT_VARIABLE} from '../lambdas/dynamodb'


export function makeTable(scope: Construct, id: string, partitionKey: string) {

    const table = new Table(scope, id, {
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: {name: partitionKey, type: AttributeType.STRING},

    })

    makeCfnOutput(scope, `${getId(table)}Name`, table.tableName)

    return table

}

export function connectLambdaToTable(lambda: Function, table: Table) {
    table.grantReadWriteData(lambda)
    lambda.addEnvironment(ENVIRONMENT_VARIABLE, table.tableName)
}

export class makeCfnOutputForTable {
}