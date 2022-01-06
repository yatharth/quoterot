// Define-time interface for declaring an SQS queue in CDK and connecting other resources to it.

import {Stack, Duration} from '@aws-cdk/core'
import {Queue} from '@aws-cdk/aws-sqs'
import {Function} from '@aws-cdk/aws-lambda'
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources'
import {QueueProps} from '@aws-cdk/aws-sqs/lib/queue'

import {
    defaultDlqDefinitionFor,
    QueueDefinition,
    queueId,
    queueUrlEnvVar,
} from '../lambdas/queue-definition'
import {makeCfnOutput} from './cdk'


export class QueueInfra {

    constructor(
        public definition: QueueDefinition,
        public queue: Queue,
    ) {}

    letLambdaPublish(lambda: Function) {
        lambda.addEnvironment(queueUrlEnvVar(this.definition), this.queue.queueUrl)
        this.queue.grantSendMessages(lambda)
    }

    subscribeLambda(lambda: Function) {

        const eventSource = new SqsEventSource(this.queue, {
            batchSize: 1,
        })

        lambda.addEventSource(eventSource)

        // FIXME: Why does this cause a circular dependency?
        // We also pass in the event source ID to the lambda, in case it wants to dynamically enable or reenable it.
        // const eventSourceId = eventSource.eventSourceMappingId
        // lambda.addEnvironment(eventSourceIdEnvVar, eventSourceId)
    }

}

export function makeQueueWithDlq(stack: Stack, queueDefinition: QueueDefinition, extraProps: QueueProps = {}):
    [queue: QueueInfra, dlq: QueueInfra] {


    // By default, `retentionPeriod` is 4 days. Max is 14 days.
    // Note: the period is calculated based on enqueue time in the original queue, not the DLQ.
    const maxRetentionPeriod = Duration.days(14)

    // How many times to retry lambda handlers on error before an item is sent to DLQ.
    // I’m setting this to 1; if the handler wants the message to be retried, they can requeue it explicitly.
    const maxReceiveCount = 1

    // Allow a generous entire minute for the lambda to finish.
    // Default is 30 seconds, max is 12 hours.
    const visibilityTimeout = Duration.minutes(1)

    // If we are trying to limit message concurrency, need to use a FIFO queue.
    // Otherwise, use a regular queue.
    const fifoProps: QueueProps = queueDefinition.concurrency != 'NO_LIMIT' ? {
        fifo: true,
        contentBasedDeduplication: true,
    } : {}

    const dlqDefinition = defaultDlqDefinitionFor(queueDefinition)

    const dlq = new Queue(stack, queueId(dlqDefinition), {
        retentionPeriod: maxRetentionPeriod,
        ...fifoProps,  // DLQ needs to be of the same type as regular queue.
    })

    const queue = new Queue(stack, queueId(queueDefinition), {

        deadLetterQueue: {
            queue: dlq,
            maxReceiveCount,
        },

        retentionPeriod: maxRetentionPeriod,
        visibilityTimeout,

        ...fifoProps,

        ...extraProps,

    })

    makeCfnOutput(stack, queueUrlEnvVar(queueDefinition), queue.queueUrl)
    makeCfnOutput(stack, queueUrlEnvVar(dlqDefinition), dlq.queueUrl)

    // // When referencing queues across stacks, you can sometimes run into dumb CDK circular dependency issues.
    // // Making sure these values are always exported helps avoid those issues.
    // stack.exportValue(queue.queueArn)
    // stack.exportValue(queue.queueName)
    // stack.exportValue(queue.queueUrl)
    // stack.exportValue(dlq.queueArn)
    // stack.exportValue(dlq.queueName)
    // stack.exportValue(dlq.queueUrl)

    return [
        new QueueInfra(queueDefinition, queue),
        new QueueInfra(dlqDefinition, dlq),
    ]

}






