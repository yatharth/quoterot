import {resolve} from 'app-root-path'

import {App, Stack} from '@aws-cdk/core'

import {RUN_JOB_SCHEDULE} from './run-schedule'
import {makeLambda} from '../helpers/cdk/stack/lambda'
import {addLambdaToNewEndpoint, makeRestApi} from '../helpers/cdk/stack/api-gateway'
import {connectLambdaToQueue, makeQueueWithDLQ, subscribeLambdaToQueue} from '../helpers/cdk/stack/sqs'
import {scheduleLambdaEvery} from '../helpers/cdk/stack/events'
import {pathRelativeTo} from '../helpers/javascript/path'
import {connectLambdaToTable} from '../helpers/cdk/stack/dynamodb'
import {Table} from '@aws-cdk/aws-dynamodb'


export class ArchiveQuotedTweetsStack extends Stack {
    constructor(app: App, archivedTweetsTable: Table) {

        super(app, 'ArchiveQuotedTweetsStack')

        // GENERAL STUFF.

        // API gateway used by all endpoints.
        const api = makeRestApi(this, 'archiveQuotedTweetsApi')

        // Lambda directory.
        const lambdasDir = resolve('src/archive-quoted-tweets/lambdas/')
        const pathToLambda = pathRelativeTo(lambdasDir)


        // QUEUES.

        // Queue for followers to check.
        const [followersToCheckQueue] = makeQueueWithDLQ(this, 'followersToCheckQueue', 'followersToCheckDLQ')

        // Queue for tweets to archive.
        const [tweetsToArchiveQueue] = makeQueueWithDLQ(this, 'tweetsToArchiveQueue', 'tweetsToArchiveDLQ')


        // LAMBDAS TO MOVE BETWEEN QUEUES.

        // Produce followers to check.
        const queueFollowersToCheck = makeLambda(this, 'queueFollowersToCheck', pathToLambda('queue-followers-to-check.ts'), {})
        scheduleLambdaEvery(this, 'queueFollowersToCheckEventRule', queueFollowersToCheck, RUN_JOB_SCHEDULE)  // Lambda runs automatically.
        addLambdaToNewEndpoint(api, ['POST'], api.root, 'queueFollowersToCheck', queueFollowersToCheck, true)  // But we can also trigger it manually.
        connectLambdaToQueue(queueFollowersToCheck, followersToCheckQueue)

        // Turn followers to check into tweets to archive.
        const parseFollowerTimelines = makeLambda(this, 'parseFollowerTimelines', pathToLambda('parse-follower-timelines.ts'), {})
        subscribeLambdaToQueue(parseFollowerTimelines, followersToCheckQueue)
        connectLambdaToQueue(parseFollowerTimelines, tweetsToArchiveQueue)

        // Consume tweets to archive.
        const archiveTweetsLambda = makeLambda(this, 'archiveTweets', pathToLambda('archive-tweets.ts'), {})
        subscribeLambdaToQueue(archiveTweetsLambda, tweetsToArchiveQueue)
        connectLambdaToTable(archiveTweetsLambda, archivedTweetsTable)

        // OTHER HOUSEKEEPING.

        // Pass in Twitter authentication secret to lambdas that need it.
        // const twitterLambdas = [queueFollowersToCheck, parseFollowerTimelines]

        // TODO: pass in
        // for (const lambda of twitterLambdas) {
        //     passLocalSecretToFunction(lambda, 'TWITTER_BEARER_TOKEN')
        // }

    }
}
