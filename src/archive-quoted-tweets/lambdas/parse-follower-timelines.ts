import {SQSEvent} from 'aws-lambda'

import {CHECK_LAST_X_HOURS_OF_TWEETS} from '../run-schedule'
import {publishAllToQueue, readDefaultQueueUrl} from '../../helpers/cdk/lambdas/sqs.old'
import {jsonStringifyCompact} from '../../helpers/javascript/stringify'
import {getTimelineFromLastXHours} from '../../helpers/twitter/rest-api/timeline'
import {getQuotedTweets} from '../../helpers/twitter/rest-api/quote-tweets'
import {getCanonicalUrl} from '../../helpers/twitter/rest-api/tweet'


async function handleFollowerId(followerId: string) {

    const isFormattedLikeUserid = (followerId: string) => /^\d+$/.test(followerId)
    if (!isFormattedLikeUserid(followerId)) {
        throw `Follower ID is not formatted like one: ${followerId}`
    }

    try {

        const timeline = await getTimelineFromLastXHours(followerId, CHECK_LAST_X_HOURS_OF_TWEETS)

        if (!timeline.tweets.length) {
            console.log(`No tweets found for follower id ${followerId} in this period.`)
            return
        }

        const quotedTweets = getQuotedTweets(timeline)
        const quotedTweetUrls = quotedTweets.map(tweet => getCanonicalUrl(tweet, timeline.includes))

        if (!quotedTweetUrls.length) {
            console.log(`No quoted tweets for follower id ${followerId} in this period.`)
            return
        }

        await publishAllToQueue(readDefaultQueueUrl(), quotedTweetUrls)

        console.log(`Successfully queued ${quotedTweetUrls.length} quoted tweets for follower id ${followerId}:`)
        console.log(jsonStringifyCompact(quotedTweetUrls))

    } catch (err) {
        console.error(`Error while handling follower id ${followerId}`)
        throw err
    }

}


export async function handler(event: SQSEvent) {

    const followerIds = event.Records.map(event => event.body)

    // WHY DO I USE A FOR (...) AWAIT ... LOOP?
    //
    // We want to NOT process each follower ID concurrently; that might hit our Twitter rate limits too quickly.
    //  Having only one thread making Twitter requests for per lambda invocation makes managing the Twitter rate
    //  limits much more predictable: I can just limit the maximum concurrency of this lambda function.

    for (const followerId of followerIds) {
        await handleFollowerId(followerId)
    }

}