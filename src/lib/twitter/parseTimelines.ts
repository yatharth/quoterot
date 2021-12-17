import {startOfHour, subHours} from 'date-fns'
import {TweetUserTimelineV2Paginator, TweetV2} from 'twitter-api-v2'

import {client} from './helpers/constants'
import {jsonStringifyPretty} from '../../helpers/stringify'


function getQuotedTweetId(tweet: TweetV2) {

    if (!tweet.referenced_tweets) return

    for (const i in tweet.referenced_tweets) {
        const referenced_tweet = tweet.referenced_tweets[i]

        if (referenced_tweet?.type == 'quoted') {
            return referenced_tweet.id
        }
    }

    return

}


function verifyNoErrors(timeline: TweetUserTimelineV2Paginator) {

    // We need bypass Typescript protection and access the protected variable `_realData`.
    // Some errors don’t seem to be exposed any other way.
    // Nor do they trigger the twitter-api-v2 package’s ApiResponseError because Twitter does not return status code ≥ 400.
    // @ts-ignore
    const errors = timeline._realData.errors

    // If no errors, nothing to do.
    if (!errors) return

    // Otherwise, throw on them.
    throw(
        "Timeline data had errors: \n" +
        jsonStringifyPretty(errors) + "\n" +
        "where returned tweets were: \n" +
        jsonStringifyPretty(timeline.tweets)
    )

}


// export async function tmp(userid: string, days: number) {
//
//     // I align the date to the hour, because that way, I can more easily recreate the exact Twitter API call
//     //  being made remotely on my local machine.
//     const now = new Date()
//     const nowAlignedToHour = startOfHour(now)
//     const endTime = nowAlignedToHour
//     const startTime = subDays(endTime, days)
//
//     console.log(`Retrieving tweets from ${startTime.toISOString()} to ${endTime.toISOString()}.`)
//
//     const timeline = await client.v2.userTimeline(userid, {
//         max_results: 100,  // 100 is the maximum allowed.
//         start_time: startTime.toISOString(),
//         end_time: endTime.toISOString(),
//
//         // For documentation on these fields, see:
//         //  https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets
//         'tweet.fields': 'created_at,author_id,referenced_tweets,entities',
//     })
//
//     console.log(`Fetched ${timeline.tweets.length} tweets.`)
//
//     verifyNoErrors(timeline)
//
//     return timeline
//
// }

async function getTweetsFromLastXHours(userid: string, hours: number) {

    // I align the date to the hour, because that way, I can more easily recreate the exact Twitter API call
    //  being made remotely on my local machine.
    const now = new Date()
    const nowAlignedToHour = startOfHour(now)
    const endTime = nowAlignedToHour
    const startTime = subHours(endTime, hours)

    console.log(`Retrieving tweets from ${startTime.toISOString()} to ${endTime.toISOString()}.`)

    // XXX: I need to handle rate-limiting somewhere.
    //  Some sort of way to exponentially back-off, but ONLY in the case of being rate-limited.
    //  Maybe Lambda step functions can help, with explicit state transitions
    //  to unrecoverable error versus rate-limit error.

    const timeline = await client.v2.userTimeline(userid, {
        max_results: 100,  // 100 is the maximum allowed.
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),

        // For documentation on these fields, see:
        //  https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets
        'tweet.fields': 'created_at,author_id,referenced_tweets,entities',
    })

    console.log(`Fetched ${timeline.tweets.length} tweets.`)

    while (timeline.meta?.next_token) {
        console.log("Fetching more tweets...")
        await timeline.fetchNext()
        console.log(`Now fetched ${timeline.tweets.length} tweets.`)
    }

    verifyNoErrors(timeline)

    return timeline.tweets

}

export async function getQuotedTweetsFromLastXHours(userid: string, hours: number) {

    const tweets = await getTweetsFromLastXHours(userid, hours)

    const removedUndefined = (arr: any[]) => arr.filter((elem) => elem != undefined)
    const removeDuplicates = (arr: any[]) => [...new Set(arr)]

    const quotedTweetIdsWithDuplicates = removedUndefined(tweets.map(getQuotedTweetId))
    const quotedTweetIds = removeDuplicates(quotedTweetIdsWithDuplicates)

    console.log(`Found ${quotedTweetIdsWithDuplicates.length} quote tweets.`)
    console.log(`Found ${quotedTweetIds.length} unique quoted tweets.`)

    return quotedTweetIds

}
