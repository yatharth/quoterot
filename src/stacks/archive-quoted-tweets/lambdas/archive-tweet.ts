import SavePageNow from '../../../helpers/archiving/archive-dot-org/save-page-now'
import {recordTweetUrl} from '../../archive-info/tables/archive-info'
import {fetchClosestArchiveUrl} from '../../../helpers/archiving/archive-dot-org/retrieve'
import {tweetsToArchiveClient} from '../queues/tweets-to-archive'
import {savesToCheckClient} from '../queues/saves-to-check'


async function archiveTweetUrl(tweetUrl: string) {

    try {

        // Record the username and url of the tweet as we saw it for future reference.
        // This will also verify that the tweet URL matches canonical format.
        await recordTweetUrl(tweetUrl)

        // If there’s an existing archive, we’re done! Nothing more to do.
        const alreadyArchivedUrl = await fetchClosestArchiveUrl(tweetUrl)
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
                // TODO: Should just requeue onto same queue. Ideally, have a JSON field that tracks
                //  how many times we tried to requeue it and discards if too many.
                throw `SPN API said host was busy while trying to archive tweet URL ${tweetUrl}`

            case 'success':
                await savesToCheckClient.publish({jobId: result.jobId, tweetUrl})
                console.log(`Successfully requested save of tweet URL ${tweetUrl} with job ID ${result.jobId}`)
                return

        }

    } catch (err) {
        console.error(`Error while trying to archive tweet URL ${tweetUrl}`)
        throw err
    }

}

export const handler = tweetsToArchiveClient.makeSqsHandler(archiveTweetUrl)
