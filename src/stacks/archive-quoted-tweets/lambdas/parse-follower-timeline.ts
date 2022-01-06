import {CHECK_LAST_X_HOURS_OF_TWEETS} from '../run-schedule'
import {jsonStringifyCompact} from '../../../helpers/javascript/stringify'
import {getTimelineFromLastXHours} from '../../../helpers/twitter/rest-api/timeline'
import {getQuotedTweets} from '../../../helpers/twitter/rest-api/quote-tweets'
import {getCanonicalUrl} from '../../../helpers/twitter/rest-api/tweet'
import {tweetsToArchiveClient} from '../queues/tweets-to-archive'
import {followersToCheckClient} from '../queues/followers-to-check'


async function handleFollowerId(followerToCheck: typeof followersToCheckClient.message) {

    const followerId = followerToCheck.followerId

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

        await tweetsToArchiveClient.publishAll(quotedTweetUrls)

        console.log(`Successfully queued ${quotedTweetUrls.length} quoted tweets for follower id ${followerId}:`)
        console.log(jsonStringifyCompact(quotedTweetUrls))

    } catch (err) {
        console.error(`Error while handling follower id ${followerId}`)
        throw err
    }

}


// WHY DO I NOT WANT TO HANDLE MESSAGES CONCURRENTLY?USE A FOR (...) AWAIT ... LOOP?
//
// We want to NOT process each follower ID concurrently; that might hit our Twitter rate limits too quickly.
//  Having only one thread making Twitter requests for per lambda invocation makes managing the Twitter rate
//  limits much more predictable: I can just limit the maximum concurrency of this lambda function.
//
// In any case, this point is moot, as the lambdas only get SQS messages in batches of one anyway.

export const handler = followersToCheckClient.makeSqsHandler(handleFollowerId)
