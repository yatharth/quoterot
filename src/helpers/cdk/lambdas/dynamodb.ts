import {DynamoDB} from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'


export const ENVIRONMENT_VARIABLE = 'TABLE_NAME'

export function readTableName() {
    const tableName = process.env[ENVIRONMENT_VARIABLE]
    if (!tableName) throw `${ENVIRONMENT_VARIABLE} not found in environment.`
    return tableName
}

export function makeDynamoClient() {
    return new DocumentClient()
}

// This will happily overwrite any existing item with the same partition key.
export async function putInTable<Schema>(client: DocumentClient, tableName: string, item: Schema) {

    await client.put({
        TableName: tableName,
        Item: item,
    }).promise()

}

export async function fetchItemById<Schema>(client: DocumentClient, tableName: string, key: Partial<Schema>) {

    const result = await client.get({
        TableName: tableName,
        Key: key,
    }).promise()

    return result.Item

}

export async function fetchAllItems(client: DocumentClient, tableName: string) {

    let startKey
    const items: DynamoDB.DocumentClient.ItemList = []

    do {

        const result: DocumentClient.ScanOutput = await client.scan({
            TableName: tableName,
            ExclusiveStartKey: startKey,
        }).promise()

        if (result.Items) {
            items.push(...result.Items)
        }

        startKey = result.LastEvaluatedKey

    } while (startKey)

    return items

}
