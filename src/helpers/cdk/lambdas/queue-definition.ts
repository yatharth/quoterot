// Provide defining parameters of an SQS queue.

/* HOW DO WE RATE-LIMIT THE QUEUES?
*
* By default, if you subscribe a lambda to an SQS queue, the messages are consumed very quickly. AWS might call your
*  lambda hundreds of times per minute. If you want to limit how many messages are processed concurrently, say to avoid
*  hitting upstream APIs too hard, AWS has no good way to do this.
*
* You can try limiting the maximum concurrency of the lambda function, but that won’t work for reasons described here:
*  https://www.foxy.io/blog/we-love-aws-lambda-but-its-concurrency-handling-with-sqs-is-silly/
*
* Instead, the workaround is to use FIFO queues instead of regular queues. This ensures that for each message group ID,
*  the message is processed by the lambda before the next message is dispatched. Thus, you can at least have only one
*  message being processed at a time.
*
* By having multiple message group IDs (say 5) and randomly assigning each message to a group ID between 1 and 5, we
*  can ensure that approximately five messages are being processed concurrently at any given time.
*
* If you want to limit concurrency this way, set the `concurrency` paramaters of `QueueDefinition` to the maximum number of
*  messages you want processed at once. A FIFO queue will be used with that many message group IDs. If you don’t care
*  about limiting concurrency this way, then just select the unlimited option. This will use a regular queue instead
*  of a FIFO queue and no message group IDs.
*
* These calculations assume your lambdas receive batches of only one message at a time from the queue.
*
* */


export type QueueDefinition = {

    // Base ID to construct the queue ID, environment variable names etc. out of.
    baseId: string

    // Set this parameter to a positive integer to limit the maximum number of messages being processed at any given time (approximate).
    // Set it to 'NO_LIMIT' if you don’t care about limiting concurrency.
    concurrency: number | 'NO_LIMIT'

}

export const queueId = (definition: QueueDefinition) => `${definition.baseId}Queue`

export const queueUrlEnvVar = (definition: QueueDefinition) => `${definition.baseId}QueueUrl`

export const eventSourceIdEnvVar = 'eventSourceId'

export const defaultDlqDefinitionFor = (definition: QueueDefinition): QueueDefinition => ({
    baseId: `${definition.baseId}Dlq`,
    concurrency: definition.concurrency,  // Same concurrency, so make it easier to redrive messages from DLQ to queue.
})
