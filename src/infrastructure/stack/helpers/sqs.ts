import {Construct} from '@aws-cdk/core'
import {Queue} from '@aws-cdk/aws-sqs'
import {Function} from '@aws-cdk/aws-lambda'
import * as cdk from '@aws-cdk/core'
import {makeCfnOutput} from './cdk'
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources'


export function makeQueueWithDLQ(scope: Construct, queueId: string, dlqId: string): [Queue, Queue] {

    // By default, `retentionPeriod` is 4 days. Max is 14 days.
    // Note: this works based on enqueue time in original queue, not in DLQ.
    const dlqRetentionPeriod = cdk.Duration.days(14)

    // How many times to retry lambda handlers and such before an item is sent to DLQ.
    // XXX: Consider increasing this if I think errors will make it finnicky.
    const maxReceiveCount = 1

    const dlq = new Queue(scope, dlqId, {
        retentionPeriod: dlqRetentionPeriod,
    })

    // TODO: Consider setting visibility timeout. Default is 30 seconds.
    // XXX: Do upstream requests to archive service need to be rate-limited? How do you make sure lambdas do that?
    const queue = new Queue(scope, queueId, {
        deadLetterQueue: {
            queue: dlq,
            maxReceiveCount,
        },
    })

    makeCfnOutput(scope, `${queueId}Url`, queue.queueUrl)

    return [queue, dlq]

}


// Allow lambda to publish to queue.
export function connectLambdaToQueue(lambda: Function, queue: Queue) {
    lambda.addEnvironment('QUEUE_URL', queue.queueUrl)
    queue.grantSendMessages(lambda)
}


// Make lambda consume from queue.
export function subscribeLambdaToQueue(lambda: Function, queue: Queue) {
    // XXX: Consider maxxing batching variables.
    // XXX: Increase batch size from 1?
    lambda.addEventSource(
        new SqsEventSource(queue, {
            // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html
            // maxBatchingWindow:
            batchSize: 1,
        }),
    )
}
