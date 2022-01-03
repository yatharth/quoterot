import {DynamoDB} from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {PromiseResult} from 'aws-sdk/lib/request'
import {AWSError} from 'aws-sdk/lib/error'

import {jsonStringifyPretty} from '../../javascript/stringify'
import {verifyNoError} from './_errors'


export interface TableParams {
    id: string,
    partitionKey: string,
    tableNameEnvVar: string
}


/* Public helper functions */

export function makeDynamoClient() {
    return new DocumentClient()
}


/* Private helpers functions */


/* Functions for interacting with table */

// TODO: Figure out how to require the Schema to be explicitly passed.

// This will happily overwrite any existing item with the same partition key.
export async function putInTable<Schema>(client: DocumentClient, tableName: string, item: Schema) {

    const result = await client.put({
        TableName: tableName,
        Item: item,
    }).promise()

    verifyNoError(result, "putting item in table")

}

export async function fetchItemByKey<Schema>(client: DocumentClient, tableName: string, key: Partial<Schema>) {

    const result = await client.get({
        TableName: tableName,
        Key: key,
    }).promise()

    verifyNoError(result, `fetching item by key ${jsonStringifyPretty(key)}`)
    return result.Item

}

export async function fetchAllItems(client: DocumentClient, tableName: string) {

    let startKey
    const items: DynamoDB.DocumentClient.ItemList = []

    do {

        const result: PromiseResult<DocumentClient.ScanOutput, AWSError> = await client.scan({
            TableName: tableName,
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
