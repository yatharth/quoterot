// Define-time interface for declaring a DynamoDB table in DK and connecting other resources to it.

import {Stack} from '@aws-cdk/core'
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb'
import {Function} from '@aws-cdk/aws-lambda'

import {TableDefinition} from '../lambdas/table-definition'
import {makeCfnOutput} from './cdk'


// TODO: How to preserve data in table if we ever change it?
//  Or at least: how to notify if we ever accidentally try to delete it?
//  Don’t want to have loss of data meant to be persistent in the table.

export class TableInfrastructure {

    table: Table
    tableNameEnvVar: string

    constructor(stack: Stack, params: TableDefinition) {

        // TODO: Need to mark as persistent?

        this.table = new Table(stack, params.id, {
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: params.partitionKey,
                type: AttributeType.STRING,
            },
        })

        this.tableNameEnvVar = params.tableNameEnvVar

        makeCfnOutput(stack, `${params.tableNameEnvVar}`, this.table.tableName)

        // When referencing tables across stacks, you can sometimes run into dumb CDK circular dependency issues.
        // Making sure these values are always exported helps avoid those issues.
        stack.exportValue(this.table.tableArn)
        stack.exportValue(this.table.tableName)

    }

    connectLambda(lambda: Function) {
        lambda.addEnvironment(this.tableNameEnvVar, this.table.tableName)
        this.table.grantReadWriteData(lambda)
    }

}
