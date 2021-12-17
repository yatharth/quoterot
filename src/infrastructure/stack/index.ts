import {join} from 'path'
import {resolve} from 'app-root-path'

import {App, Stack} from '@aws-cdk/core'

import {makeLambda} from './helpers/lambda'
import {makeCfnOutput} from './helpers/cdk'
import {addLambdaToNewEndpoint, makeApi} from './helpers/restApi'
import {connectLambdaToQueue, makeQueueWithDLQ, subscribeLambdaToQueue} from './helpers/sqs'
import {scheduleLambdaEvery} from './helpers/eventScheduling'
import {RUN_JOB_SCHEDULE} from '../constants'
import {passLocalSecretToFunction, readLocalSecret} from './helpers/secrets'


export class QuoteRotStack extends Stack {
    constructor(app: App, id: string) {
        super(app, id)


        // GENERAL STUFF.

        // API gateway for the app (used by all endpoints).
        const api = makeApi(this, 'QuoteRotApi')
        makeCfnOutput(this, 'apiUrl', api.url)

        // Lambda directory.
        const lambdasDir = resolve('src/infrastructure/lambdas/')  // Alternatively: join(__dirname, '../lambdas')
        const pathToLambda = (lambdaFilename: string) => join(lambdasDir, lambdaFilename)


        // QUEUES.

        // Queue for followers to check.
        const [followersToCheckQueue] = makeQueueWithDLQ(this, 'followersToCheckQueue', 'followersToCheckDLQ')

        // Queue for tweets to archive.
        const [tweetsToArchiveQueue] = makeQueueWithDLQ(this, 'tweetsToArchiveQueue', 'tweetsToArchiveDLQ')


        // LAMBDAS TO MOVE BETWEEN QUEUES.

        // Produce followers to check.
        const queueFollowersToCheck = makeLambda(this, 'queueFollowersToCheck', pathToLambda('queue-followers-to-check.ts'), {})
        scheduleLambdaEvery(this, 'queueFollowersToCheckEventRule', queueFollowersToCheck, RUN_JOB_SCHEDULE)  // Lambda runs automatically.
        addLambdaToNewEndpoint(api.root, 'queueFollowersToCheck', 'POST', queueFollowersToCheck)  // But we can also trigger it manually.
        connectLambdaToQueue(queueFollowersToCheck, followersToCheckQueue)


        // Turn followers to check into tweets to archive.
        const parseFollowerTimelines = makeLambda(this, 'parseFollowerTimelines', pathToLambda('parse-follower-timelines.ts'), {})
        subscribeLambdaToQueue(parseFollowerTimelines, followersToCheckQueue)
        connectLambdaToQueue(parseFollowerTimelines, tweetsToArchiveQueue)

        // Consume tweets to archive.
        const archiveTweetsLambda = makeLambda(this, 'archiveTweets', pathToLambda('archive-tweets.ts'), {})
        subscribeLambdaToQueue(archiveTweetsLambda, tweetsToArchiveQueue)


        // OTHER HOUSEKEEPING.

        // Pass in Twitter authentication secret to lambdas that need it.
        const twitterLambdas = [queueFollowersToCheck, parseFollowerTimelines]
        for (const lambda of twitterLambdas) {
            passLocalSecretToFunction(lambda, 'TWITTER_V2_BEARER_TOKEN')
        }
        makeCfnOutput(this, 'TWITTER_V2_BEARER_TOKEN', readLocalSecret('TWITTER_V2_BEARER_TOKEN'))


    }
}

const app = new App()
new QuoteRotStack(app, 'QuoteRotStack')
app.synth()
