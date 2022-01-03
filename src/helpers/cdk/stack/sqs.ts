import {Construct, Duration} from '@aws-cdk/core'
import {Queue} from '@aws-cdk/aws-sqs'
import {Function} from '@aws-cdk/aws-lambda'
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources'

import {makeCfnOutput} from './cfn'
import {QueueParams, QueueRuntime} from '../lambdas/sqs'
import {QueueProps} from '@aws-cdk/aws-sqs/lib/queue'






export function makeQueueWithDLQ(scope: Construct, queueId: string, dlqId: string,
    extraProps: QueueProps = {}): [Queue, Queue] {

    // By default, `retentionPeriod` is 4 days. Max is 14 days.
    // Note: the period is calculated based on enqueue time in the original queue, not the DLQ.
    const maxRetentionPeriod = Duration.days(14)

    // How many times to retry lambda handlers on error before an item is sent to DLQ.
    // I’m setting this to 1; if the handler wants the message to be retried, they can requeue it explicitly.
    const maxReceiveCount = 1

    // Allow a generous entire minute for the lambda to finish.
    // Default is 30 seconds, max is 12 hours.
    const visibilityTimeout = Duration.minutes(1)

    const dlq = new Queue(scope, dlqId, {
        retentionPeriod: maxRetentionPeriod,
    })

    const queue = new Queue(scope, queueId, {

        retentionPeriod: maxRetentionPeriod,

        deadLetterQueue: {
            queue: dlq,
            maxReceiveCount,
        },

        visibilityTimeout,

        ...extraProps,

    })

    makeCfnOutput(scope, `${queueId}Url`, queue.queueUrl)

    return [queue, dlq]

}


// Allow lambda to publish to queue.
export function letLambdaQueueTo(lambda: Function, queue: Queue, queueUrlEnvVar: string = DEFAULT_QUEUE_URL_ENVIRONMENT_VARIABLE) {
    lambda.addEnvironment(queueUrlEnvVar, queue.queueUrl)
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


// what if want to interact with dlq?
// really wanna initialise this with just concurrency, envVar (must match), runtype
// the other needs concurrency, envVar (must match), id, dlqIq if necessary, which maybe gets its own queue, idk
// so have a make queueAndDlq function which just calls this twice?
// just don't like this code man. opauqe.


export class QueueInfrastructure {

    queueRuntime: QueueRuntime<any>
    queue: Queue
    dlq: Queue

    constructor(scope: Construct, queueRuntime: QueueRuntime<any>, extraProps: QueueProps = {}) {

        this.queueRuntime = queueRuntime

        queueId

        // By default, `retentionPeriod` is 4 days. Max is 14 days.
        // Note: the period is calculated based on enqueue time in the original queue, not the DLQ.
        const maxRetentionPeriod = Duration.days(14)

        // How many times to retry lambda handlers on error before an item is sent to DLQ.
        // I’m setting this to 1; if the handler wants the message to be retried, they can requeue it explicitly.
        const maxReceiveCount = 1

        // Allow a generous entire minute for the lambda to finish.
        // Default is 30 seconds, max is 12 hours.
        const visibilityTimeout = Duration.minutes(1)

        const dlq = new Queue(scope, dlqId, {
            retentionPeriod: maxRetentionPeriod,
        })

        const queue = new Queue(scope, queueId, {

            retentionPeriod: maxRetentionPeriod,

            deadLetterQueue: {
                queue: dlq,
                maxReceiveCount,
            },

            visibilityTimeout,

            ...extraProps,

        })

        makeCfnOutput(scope, `${queueId}Url`, queue.queueUrl)

    }

    makeQueueAndDLQ() {

    }

    letLambdaPublish(lambda: Function) {
        lambda.addEnvironment(this.queueRuntime.queueUrlEnvVar, this.queue.queueUrl)
        this.queue.grantSendMessages(lambda)
    }

    subscribeLambda(lambda: Function) {
        lambda.addEventSource(
            new SqsEventSource(this.queue, {
                // For documentation of these options, see:
                //  https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html
                // maxBatchingWindow:
                batchSize: 1,
            })
        )
    }

}


