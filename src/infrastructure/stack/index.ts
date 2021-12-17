import {join} from 'path'

import {App, Stack} from '@aws-cdk/core'
import {Topic} from '@aws-cdk/aws-sns'
import {EmailSubscription} from '@aws-cdk/aws-sns-subscriptions'

import {makeLambda} from './helpers/lambda'
import {makeCfnOutput} from './helpers/cdk'
import {addLambdaToNewEndpoint, makeApi} from './helpers/restApi'
import {connectLambdaToQueue, makeQueueWithDLQ, subscribeLambdaToQueue} from './helpers/sqs'
import {scheduleLambdaEvery} from './helpers/events'
import {RUN_JOB_SCHEDULE} from '../constants'


const lambdasDir = join(__dirname, '../lambdas')


export class QuoteRotStack extends Stack {
    constructor(app: App, id: string) {
        super(app, id)


        // GENERAL STUFF.

        // Topic to send emails on errors (not used right now).
        const errorsTopic = new Topic(this, 'errorsTopic')
        errorsTopic.addSubscription(new EmailSubscription('yatharth999@gmail.com'))

        // API gateway for the app (used by all endpoints).
        const api = makeApi(this, 'QuoteRotApi')
        makeCfnOutput(this, 'apiUrl', api.url)


        // QUEUES.

        // Queue for followers to check.
        const [followersToCheckQueue] = makeQueueWithDLQ(this, 'followersToCheckQueue', 'followersToCheckDLQ')

        // Queue for tweets to archive.
        const [tweetsToArchiveQueue] = makeQueueWithDLQ(this, 'tweetsToArchiveQueue', 'tweetsToArchiveDLQ')


        // LAMBDAS TO MOVE BETWEEN QUEUES.

        // Produce followers to check.
        const queueFollowersToCheck = makeLambda(this, 'queueFollowersToCheck', join(lambdasDir, 'queue-followers-to-check.ts'), {})
        connectLambdaToQueue(queueFollowersToCheck, followersToCheckQueue)
        scheduleLambdaEvery(this, 'queueFollowersToCheckEventRule', queueFollowersToCheck, RUN_JOB_SCHEDULE)  // Lambda runs automatically.
        addLambdaToNewEndpoint(api.root, 'queueFollowersToCheck', 'POST', queueFollowersToCheck)  // But we can also trigger it manually.


        // Turn followers to check into tweets to archive.
        const parseFollowerTimelines = makeLambda(this, 'parseFollowerTimelines', join(lambdasDir, 'parse-follower-timelines.ts'), {})
        connectLambdaToQueue(parseFollowerTimelines, tweetsToArchiveQueue)
        subscribeLambdaToQueue(parseFollowerTimelines, followersToCheckQueue)

        // Consume tweets to archive.
        const archiveTweetsLambda = makeLambda(this, 'archiveTweets', join(lambdasDir, 'archive-tweets.ts'), {})
        subscribeLambdaToQueue(archiveTweetsLambda, tweetsToArchiveQueue)

    }
}

const app = new App()
new QuoteRotStack(app, 'QuoteRotStack')
app.synth()
