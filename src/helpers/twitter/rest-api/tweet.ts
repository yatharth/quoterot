import {TweetV2, UserV2} from 'twitter-api-v2'
import {Tweetv2FieldsParams} from 'twitter-api-v2/dist/types/v2/tweet.v2.types'
import {ApiV2Includes} from 'twitter-api-v2/dist/types/v2/tweet.definition.v2'

import {client} from './_auth'
import {verifyNoErrors} from './_errors'


// For documentation on these fields, see:
//  https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets
export const tweetParams: Partial<Tweetv2FieldsParams> = {
    'tweet.fields': 'id,author_id,created_at,text,in_reply_to_user_id,referenced_tweets,entities,public_metrics,reply_settings',
    'user.fields': 'id,username,name,protected',
    'expansions': 'author_id,entities.mentions.username,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id',
}

export async function fetchTweet(tweetId: string) {
    const result = await client.v2.singleTweet(tweetId, tweetParams)
    verifyNoErrors(result, "getting a tweet")
    return result
}

export function getUser(tweet: TweetV2, includes?: ApiV2Includes): UserV2 {
    if (!tweet.author_id) throw "Tweet does not have author_id field."
    if (!includes?.users) throw "Tweet object does not have includes for users."
    const user = includes.users.find(user => user.id == tweet.author_id)
    if (!user) throw "Could not find user in includes."
    return user
}

// Note: this will reconstruct the URL based on the username at the time of pulling the tweet data.
//  If the username changes, this URL will change too. Therefore, if you archived a tweet URL
//  under a different username, you won’t find it again with the new URL.
export function getCanonicalUrl(tweet: TweetV2, includes?: ApiV2Includes) {
    const username = getUser(tweet, includes).username
    const url = `https://twitter.com/${username}/status/${tweet.id}`
    return url
}
