import {TweetUserTimelineV2Paginator, TweetV2, TweetV2SingleResult} from 'twitter-api-v2'


// Make sure whatever API call you made to Twitter included 'referenced_tweet' in 'tweet.fields'.
//  Otherwise, we won’t find the 'referenced_tweet' field and will assume the tweet is not a quote tweet.
function getQuotedTweetId(tweet: TweetV2): string | undefined {

    return tweet.referenced_tweets?.find(referenced_tweet => referenced_tweet.type == 'quoted')?.id

    // This one-liner is equivalent to:

    // if (!tweet.referenced_tweets) return
    //
    // for (const referenced_tweet of tweet.referenced_tweets) {
    //     if (referenced_tweet?.type == 'quoted') {
    //         return referenced_tweet.id
    //     }
    // }
    //
    // return

}


export function getQuotedTweet(result: TweetV2SingleResult): TweetV2 | undefined {

    const quotedTweetId = getQuotedTweetId(result.data)
    if (!quotedTweetId) return

    if (!result.includes?.tweets)
        throw "Tweet object did not have includes for tweets."

    return result.includes.tweets.find((tweet) => tweet.id == quotedTweetId)

}


function getQuotedTweetIds(tweets: TweetV2[]): string[] {

    const removedUndefined = (arr: any[]) => arr.filter((elem) => elem != undefined)
    const removeDuplicates = (arr: any[]) => [...new Set(arr)]

    const quotedTweetIdsWithDuplicates = removedUndefined(tweets.map(getQuotedTweetId))
    const quotedTweetIds = removeDuplicates(quotedTweetIdsWithDuplicates)

    console.log(`Found ${quotedTweetIds.length} unique quoted tweets (${quotedTweetIdsWithDuplicates.length} including duplicates).`)

    return quotedTweetIds

}


export function getQuotedTweets(timeline: TweetUserTimelineV2Paginator): TweetV2[] {

    // I should be able to change the TweetUserTimelineV2Paginator type to TweetsV2Paginator,
    //  but sadly, twitter-api-v2 doesn’t export that type.

    const quotedTweetIds = getQuotedTweetIds(timeline.tweets)

    if (!timeline.tweets.length)
        return []

    if (!timeline.includes?.tweets)
        throw "Timeline does have includes for tweets."

    const isUndefined = (elem: unknown) => elem === undefined

    const quotedTweets = quotedTweetIds.map(quotedTweetId =>
        timeline.includes.tweets?.find(tweet => tweet.id == quotedTweetId))

    if (quotedTweets.some(isUndefined)) {
        const indexOfMissing = quotedTweets.findIndex(isUndefined)
        throw `Could not find quoted tweet with ID ${quotedTweetIds[indexOfMissing]} in includes.`
    }

    return quotedTweets as TweetV2[]

}
