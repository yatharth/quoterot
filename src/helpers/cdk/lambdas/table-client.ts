// Run-time interface for interacting with a DynamoDB table resource in a type-safe way.

import {DynamoDB} from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {PromiseResult} from 'aws-sdk/lib/request'
import {AWSError} from 'aws-sdk/lib/error'

import {verifyNoError} from './_errors'
import {TableDefinition} from './table-definition'
import {readFromEnv} from './secrets'


// `Schema` must be explicitly passed in.
export class TableClient<Schema = never> {

    definition: TableDefinition
    dynamoClient: DocumentClient

    constructor(definition: TableDefinition) {
        this.dynamoClient = new DocumentClient()
        this.definition = definition
    }


    private readTableName() {
        return readFromEnv(this.definition.tableNameEnvVar)
    }


    // This will happily overwrite any existing item with the same partition key.
    async putInTable(item: Schema) {

        const result = await this.dynamoClient.put({
            TableName: this.readTableName(),
            Item: item,
        }).promise()

        verifyNoError(result, "putting item in table")

    }


    // Returns either the item if found, or undefined if not found.
    async fetchItemByKey(id: string) {

        const result = await this.dynamoClient.get({
            TableName: this.readTableName(),
            Key: {
                [this.definition.partitionKey]: id,
            },
        }).promise()

        verifyNoError(result, `fetching item by key ${this.definition.partitionKey} = ${id}`)
        return result.Item

    }


    async fetchAllItems() {

        let startKey: DocumentClient.Key | undefined

        const items: DynamoDB.DocumentClient.ItemList = []

        do {

            const result: PromiseResult<DocumentClient.ScanOutput, AWSError> = await this.dynamoClient.scan({
                TableName: this.readTableName(),
                ExclusiveStartKey: startKey,
            }).promise()

            verifyNoError(result, "fetching all items")

            if (result.Items) {
                items.push(...result.Items)
            }

            startKey = result.LastEvaluatedKey

        } while (startKey)

        return items

    }


}

