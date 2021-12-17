import assert from 'assert'

import {SQSEvent} from 'aws-lambda'

import {CHECK_LAST_X_HOURS_OF_TWEETS} from '../constants'
import {publishAllToQueue} from './helpers/sqs'
import {getQuotedTweetsFromLastXHours} from '../../lib/twitter/parseTimelines'
import {jsonStringifyCompact} from '../../helpers/stringify'


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

    const quotedTweetIds = await getQuotedTweetsFromLastXHours(followerId, CHECK_LAST_X_HOURS_OF_TWEETS)

    console.log(`Queuing ${quotedTweetIds.length} quoted tweet IDs: ${jsonStringifyCompact(quotedTweetIds)}`)

    await publishAllToQueue(queueUrl, quotedTweetIds)

}


export async function handler(event: SQSEvent) {

    const queueUrl = process.env['QUEUE_URL']
    assert(queueUrl, "No QUEUE_URL supplied.")

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