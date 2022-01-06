// Provide defining parameters of a DynamoDB table.

export interface TableDefinition {
    id: string,
    partitionKey: string,
    tableNameEnvVar: string
}