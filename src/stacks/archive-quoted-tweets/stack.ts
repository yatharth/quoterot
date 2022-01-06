// This stack monitors all the followers of the @quoterot Twitter account and archives any tweets they quote.
//
// The `run-schedule.ts` file defines how often to run. Based on this schedule, the `queueFollowersToCheck` lambda
//  function is automatically run. It uses the Twitter REST API to get all the followers of the @quoterot account.
//  Those followers are then put onto a `followersToCheckQueue` queue.
//
// That `followersToCheck` queue sends its items to a `parseFollowerTimeline` lambda function. For each follower,
//  that function uses the Twitter REST API to fetch their recent tweets. If any of them are quote tweets of other
//  tweets, those quoted tweets are put on the `tweetsToArchive` queue.
//
// That `tweetsToArchive` queue then sends its items to the `archiveTweet` lambda function. If the tweet was already
//  archived, it’s done; otherwise, it requests the tweet to be archived, and puts the job ID in the `savesToCheck` queue.
//
// Finally, the `savesToCheck` queue checks to see if the requested save was successfully completed. If not, it errors out.
//
// If the lambdas fail to process any item, they are sent to a “Dead Letter Queue” configured for each queue,
//  which holds those items for about a fortnight. Errors are logged on any lambda error. You can use dashbird.io
//  to monitor the CloudWatch logs and send emails on any lambda error.



import {resolve} from 'app-root-path'

import {App, Duration, Stack, StackProps} from '@aws-cdk/core'

import {RUN_JOB_SCHEDULE} from './run-schedule'
import {makeLambda, scheduleLambdaEvery} from '../../helpers/cdk/stack/lambda'
import {addLambdaToNewEndpoint, makeRestApi} from '../../helpers/cdk/stack/api-gateway'
import {pathRelativeTo} from '../../helpers/javascript/path'
import {readSecretsFromEnvFile} from '../../helpers/cdk/stack/secrets'
import {ArchiveInfoStack} from '../archive-info/stack'
import {makeQueueWithDlq} from '../../helpers/cdk/stack/queue-infra'
import {followersToCheckDefinition} from './queues/followers-to-check'
import {tweetsToArchiveDefinition} from './queues/tweets-to-archive'
import {savesToCheckDefinition} from './queues/saves-to-check'


export class ArchiveQuotedTweetsStack extends Stack {
    constructor(app: App, stackProps: StackProps, archiveInfoStack: ArchiveInfoStack) {

        super(app, 'ArchiveQuotedTweetsStack', stackProps)


        // HELPERS.

        const api = makeRestApi(this, 'archiveQuotedTweetsApi')
        const pathToLambda = pathRelativeTo(resolve('src/stacks/archive-quoted-tweets/lambdas/'))
        const secrets = readSecretsFromEnvFile(resolve('secrets/.env'))


        // QUEUES.

        const [followersToCheckQueue] = makeQueueWithDlq(this, followersToCheckDefinition)
        const [tweetsToArchiveQueue] = makeQueueWithDlq(this, tweetsToArchiveDefinition)
        const [savesToCheckQueue] = makeQueueWithDlq(this, savesToCheckDefinition, {

            // Allow more than enough time for the archive job to complete.
            // If a job is still pending at this point, we consider it some sort of error.
            deliveryDelay: Duration.minutes(10),

        })


        // LAMBDAS TO MOVE BETWEEN QUEUES.

        // Produce followers to check.
        const queueFollowersToCheck = makeLambda(this, 'queueFollowersToCheck', pathToLambda('queue-followers-to-check.ts'), secrets)
        scheduleLambdaEvery(this, 'queueFollowersToCheckEventRule', queueFollowersToCheck, RUN_JOB_SCHEDULE)  // Lambda runs automatically.
        addLambdaToNewEndpoint(api, ['POST'], api.root, 'queueFollowersToCheck', queueFollowersToCheck, true)  // But we can also trigger it manually.
        followersToCheckQueue.letLambdaPublish(queueFollowersToCheck)

        // Turn followers to check -> tweets to archive.
        const parseFollowerTimeline = makeLambda(this, 'parseFollowerTimelines', pathToLambda('parse-follower-timeline.ts'), secrets)
        followersToCheckQueue.subscribeLambda(parseFollowerTimeline)
        tweetsToArchiveQueue.letLambdaPublish(parseFollowerTimeline)

        // Turn tweets to archive -> saves to check.
        const archiveTweet = makeLambda(this, 'archiveTweets', pathToLambda('archive-tweet.ts'), secrets)
        tweetsToArchiveQueue.subscribeLambda(archiveTweet)
        savesToCheckQueue.letLambdaPublish(archiveTweet)
        archiveInfoStack.archiveInfoTable.connectLambda(archiveTweet)

        // Consume saves to check.
        const checkSaveStatus = makeLambda(this, 'checkSaveStatus', pathToLambda('check-save-status.ts'), secrets)
        savesToCheckQueue.subscribeLambda(checkSaveStatus)

    }
}
