import {forEach} from 'p-iteration'

import {SQSEvent} from 'aws-lambda'

import SavePageNow from '../../helpers/save-page-now'
import {publishToQueue, readDefaultQueueUrl} from '../../helpers/cdk/lambdas/sqs.old'
import {recordTweetUrl} from '../../archive-info/tables/archive-info'
import {getLastArchiveUrl} from '../../helpers/save-page-now/retrieve'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'


async function archiveTweetUrl(tweetUrl: string) {

    try {

        // Record the username and url of the tweet as we saw it for future reference.
        // This will also verify that the tweet URL matches canonical format.
        await recordTweetUrl(tweetUrl)

        // If there’s an existing archive, we’re done! Nothing more to do.
        const alreadyArchivedUrl = await getLastArchiveUrl(tweetUrl)
        if (alreadyArchivedUrl) {
            console.log(`Tweet URL ${tweetUrl} was already saved at ${alreadyArchivedUrl}`)
            return
        }

        // Otherwise, request a save and queue checking on the job.
        const spn = await SavePageNow.create()
        const result = await spn.requestSave(tweetUrl)

        switch (result.status) {

            case 'alreadyExists':
                console.log(`SPN API said tweet URL ${tweetUrl} was already saved recently.`)
                console.log(result.response)
                return

            case 'hostBusy':
                // TODO: Remove this dynamic reference to env var.
                // We wanna pause entire queue.
                await publishToQueue(readFromEnv('REQUEUE_URL'), tweetUrl)

        }

        await publishToQueue(readDefaultQueueUrl(), jobId)

        console.log(`Successfully requested save of tweet URL ${tweetUrl}`)

    } catch (err) {
        console.error(`Error while trying to archive tweet URL ${tweetUrl}`)
        throw err
    }

}

// Better a step function, pulls from queue or exponential backoff, archvies, backs off exponentially, pulls explicitly; if none, calls itself


export async function handler(event: SQSEvent) {
    const tweetUrlsToArchive = event.Records.map(record => record.body)
    await forEach(tweetUrlsToArchive, archiveTweetUrl)
}
