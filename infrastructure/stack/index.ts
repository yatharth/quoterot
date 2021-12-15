import {join} from 'path'

import * as cdk from '@aws-cdk/core'
import {Topic} from '@aws-cdk/aws-sns'
import {Queue} from '@aws-cdk/aws-sqs'
import {EmailSubscription} from '@aws-cdk/aws-sns-subscriptions'

import {makeLambda, subscribeLambdaToQueue} from './helpers/lambda'
import {makeCfnOutput} from './helpers/cdk'
import {addLambdaHandler, addUrlPart, makeApi} from './helpers/restApi'


const lambdasDir = join(__dirname, '../lambdas')


export class QuoteRotStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id)

        // Topic to send emails on errors.
        const errorsTopic = new Topic(this, 'errorsTopic')
        errorsTopic.addSubscription(new EmailSubscription('yatharth999@gmail.com'))

        // Dead letter queue to hold tweets we couldn’t archive.
        const tweetsToArchiveDeadLetterQueue = new Queue(this, 'tweetsToArchiveDeadLetterQueue', {
            retentionPeriod: cdk.Duration.days(14),  // By default, 4 days. Max is 14 days.
            // TODO: Consider setting visibility timeout. Default is 30 seconds.
        })

        // Queue to hold quoted tweet URLs waiting to be archived.
        // TODO: Do upstream requests to archive service need to be rate-limited? How do you make sure lambdas do that?
        // XXX: Consider increasing `maxReceiveCount`, especially based if errors make it finnicky?
        const tweetsToArchiveQueue = new Queue(this, 'tweetsToArchiveQueue', {
            deadLetterQueue: {
                queue: tweetsToArchiveDeadLetterQueue,
                maxReceiveCount: 1,  // How many times to retry the lambda handler before an item is sent to DLQ.
            },
        })
        makeCfnOutput(this, 'tweetsToArchiveQueueUrl', tweetsToArchiveQueue.queueUrl)

        // Create lambda to handle tweets waiting to be archived.
        const archiveTweetsLambda = makeLambda(this, 'archiveTweets', join(lambdasDir, 'archive-tweets.ts'), {})
        subscribeLambdaToQueue(archiveTweetsLambda, tweetsToArchiveQueue)

        // Create Rest API for app.
        const api = makeApi(this, 'QuoteRotApi')

        // Create lambda to push messages to queue.
        const publishToQueue = makeLambda(this, 'publishToQueue', join(lambdasDir, 'publish-to-queue.ts'), {})
        publishToQueue.addEnvironment('QUEUE_URL', tweetsToArchiveQueue.queueUrl)
        tweetsToArchiveQueue.grantSendMessages(publishToQueue)

        // Create API endpoint for said lambda.
        const apiQueue = addUrlPart(api.root, 'queue')
        addLambdaHandler(apiQueue, 'GET', publishToQueue)
        makeCfnOutput(this, 'publishToQueueEndpoint', `${api.url}${apiQueue.path.slice(1)}`)

    }
}

const app = new cdk.App()
new QuoteRotStack(app, 'QuoteRotStack')
app.synth()
