import {resolve} from 'app-root-path'

import {App, Duration, Stack, StackProps} from '@aws-cdk/core'

import {RUN_JOB_SCHEDULE} from './run-schedule'
import {makeLambda} from '../helpers/cdk/stack/lambda'
import {addLambdaToNewEndpoint, makeRestApi} from '../helpers/cdk/stack/api-gateway'
import {letLambdaQueueTo, makeQueueWithDLQ, subscribeLambdaToQueue} from '../helpers/cdk/stack/sqs'
import {scheduleLambdaEvery} from '../helpers/cdk/stack/events'
import {pathRelativeTo} from '../helpers/javascript/path'
import {readSecretsFromEnvFile} from '../helpers/cdk/stack/secrets'
import {ArchiveInfoStack} from '../archive-info/stack'


export class ArchiveQuotedTweetsStack extends Stack {
    constructor(app: App, stackProps: StackProps, archiveInfoStack: ArchiveInfoStack) {

        super(app, 'ArchiveQuotedTweetsStack', stackProps)


        // HELPERS.

        const api = makeRestApi(this, 'archiveQuotedTweetsApi')

        const lambdasDir = resolve('src/archive-quoted-tweets/lambdas/')
        const pathToLambda = pathRelativeTo(lambdasDir)

        const secrets = readSecretsFromEnvFile(resolve('secrets/.env'))

        // QUEUES.

        // TODO: Define runtime-validatable types for each queue,
        //  and some functionality for type-checked queueing/dequeueing.

        const [followersToCheckQueue] = makeQueueWithDLQ(this, 'followersToCheckQueue', 'followersToCheckDLQ')

        const [tweetsToArchiveQueue] = makeQueueWithDLQ(this, 'tweetsToArchiveQueue', 'tweetsToArchiveDLQ')

        const [savesToCheckQueue] = makeQueueWithDLQ(this, 'savesToCheckQueue', 'savesToCheckDLQ', {

            // Delay all messages by 15 minutes to allow Save Page Now time to archive, before we check job status.
            // Default 0, max 15 minutes.
            deliveryDelay: Duration.minutes(15),

        })


        // LAMBDAS TO MOVE BETWEEN QUEUES.

        // Produce followers to check.
        const queueFollowersToCheck = makeLambda(this, 'queueFollowersToCheck', pathToLambda('queue-followers-to-check.ts'), secrets)
        scheduleLambdaEvery(this, 'queueFollowersToCheckEventRule', queueFollowersToCheck, RUN_JOB_SCHEDULE)  // Lambda runs automatically.
        addLambdaToNewEndpoint(api, ['POST'], api.root, 'queueFollowersToCheck', queueFollowersToCheck, true)  // But we can also trigger it manually.
        letLambdaQueueTo(queueFollowersToCheck, followersToCheckQueue)

        // Turn followers to check into tweets to archive.
        const parseFollowerTimelines = makeLambda(this, 'parseFollowerTimelines', pathToLambda('parse-follower-timelines.ts'), secrets)
        subscribeLambdaToQueue(parseFollowerTimelines, followersToCheckQueue)
        letLambdaQueueTo(parseFollowerTimelines, tweetsToArchiveQueue)

        // Request archives for all tweets to save.
        const archiveTweetsLambda = makeLambda(this, 'archiveTweets', pathToLambda('archive-tweets.ts'), secrets)
        subscribeLambdaToQueue(archiveTweetsLambda, tweetsToArchiveQueue)
        letLambdaQueueTo(archiveTweetsLambda, tweetsToArchiveQueue, 'REQUEUE_URL')  // Allow requeueing.
        letLambdaQueueTo(archiveTweetsLambda, savesToCheckQueue)
        archiveInfoStack.archiveInfoTable.connectLambda(archiveTweetsLambda)

        // Check status of saves.
        const checkSaveStatus = makeLambda(this, 'checkSaveStatus', pathToLambda('check-save-status.ts'), secrets)
        subscribeLambdaToQueue(checkSaveStatus, savesToCheckQueue)
        letLambdaQueueTo(checkSaveStatus, savesToCheckQueue)  // Allow requeueing.
        archiveInfoStack.archiveInfoTable.connectLambda(checkSaveStatus)

    }
}
