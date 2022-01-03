import {Construct} from '@aws-cdk/core'
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb'
import {Function} from '@aws-cdk/aws-lambda'

import {makeCfnOutput} from './cfn'
import {TableParams} from '../lambdas/dynamodb'


export class DynamoDbTable {

    table: Table
    tableNameEnvVar: string

    constructor(scope: Construct, params: TableParams) {

        // TODO: Need to mark as persistent?

        this.table = new Table(scope, params.id, {
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {name: params.partitionKey, type: AttributeType.STRING},
        })

        makeCfnOutput(scope, `${params.tableNameEnvVar}`, this.table.tableName)

        this.tableNameEnvVar = params.tableNameEnvVar
    }

    connectLambda(lambda: Function) {
        this.table.grantReadWriteData(lambda)
        lambda.addEnvironment(this.tableNameEnvVar, this.table.tableName)
    }

}
