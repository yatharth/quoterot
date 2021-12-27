import {SQSEvent} from 'aws-lambda'

import {CHECK_LAST_X_HOURS_OF_TWEETS} from '../run-schedule'
import {publishAllToQueue, readQueueUrl} from '../../helpers/cdk/lambdas/sqs'
import {jsonStringifyCompact} from '../../helpers/javascript/stringify'
import {getTimelineFromLastXHours} from '../../helpers/twitter/rest-api/timeline'
import {getQuotedTweets} from '../../helpers/twitter/rest-api/quote-tweets'
import {getCanonicalUrl} from '../../helpers/twitter/rest-api/tweet'


function extractFollowerIds(event: SQSEvent) {
    console.log(`Parsing ${event.Records.length} records...`)

    const followerIds = event.Records.map((event) => event.body)

    const isFormattedLikeUserid = (followerId: string) => /^\d+$/.test(followerId)

    followerIds.forEach((followerId) => {

        if (followerId.includes('fail')) {
            throw "Received fail keyword!"
        }

        if (!isFormattedLikeUserid(followerId)) {
            throw `This doesn’t look like a user id: ${jsonStringifyCompact(followerId)}`
        }

    })

    console.log(`Parsed ${followerIds.length} follower IDs: ${jsonStringifyCompact(followerIds)}`)
    return followerIds
}


async function handleFollowerId(followerId: string, queueUrl: string) {
    console.log(`Handling follower ${followerId}...`)

    const timeline = await getTimelineFromLastXHours(followerId, CHECK_LAST_X_HOURS_OF_TWEETS)
    const quotedTweets = getQuotedTweets(timeline)
    const quotedTweetUrls = quotedTweets.map(tweet => getCanonicalUrl(tweet, timeline.includes))

    console.log(`Queuing ${quotedTweetUrls.length} quoted tweets: ${jsonStringifyCompact(quotedTweetUrls)}`)

    await publishAllToQueue(queueUrl, quotedTweetUrls)

}


export async function handler(event: SQSEvent) {

    const queueUrl = readQueueUrl()

    const followerIds = extractFollowerIds(event)

    // We want to NOT process each follower ID concurrently; that might hit our Twitter rate limits too quickly.
    //  Instead, having only one thread making Twitter requests per invocation of this lambda function
    //  makes managing the rate limits much more predictable. I can just limit the maximum concurrency
    //  of this lambda function. This is why I use a for (... of ...) await ... loop.
    for (const followerId of followerIds) {
        await handleFollowerId(followerId, queueUrl)
    }

    console.log(`All done! Handled ${event.Records.length} records.`)
}