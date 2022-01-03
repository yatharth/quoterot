import {TweetV2, UserV2} from 'twitter-api-v2'
import {Tweetv2FieldsParams} from 'twitter-api-v2/dist/types/v2/tweet.v2.types'
import {ApiV2Includes} from 'twitter-api-v2/dist/types/v2/tweet.definition.v2'

import {client} from './_auth'
import {verifyNoErrors} from './_errors'
import {Static, String} from 'runtypes'


// TODO: Consider getting media fields, poll fields—everything. Doesn’t count against any quotes.
//  Would just use a bit more storage in DynamoDB or CloudWatch logs.

// For documentation on these fields, see:
//  https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets
export const allTweetParams: Partial<Tweetv2FieldsParams> = {
    'expansions': 'attachments.poll_ids,attachments.media_keys,author_id,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id',
    'media.fields': 'duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics,non_public_metrics,organic_metrics,promoted_metrics,alt_text',
    'place.fields': 'contained_within,country,country_code,full_name,geo,id,name,place_type',
    'poll.fields': 'duration_minutes,end_datetime,id,options,voting_status',
    'tweet.fields': 'attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,non_public_metrics,public_metrics,organic_metrics,promoted_metrics,possibly_sensitive,referenced_tweets,reply_settings,source,text,withheld',
    'user.fields': 'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld',
}
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

export function getAuthor(tweet: TweetV2, includes?: ApiV2Includes): UserV2 {
    if (!tweet.author_id) throw "Tweet does not have author_id field."
    if (!includes?.users) throw "Tweet object does not have includes for users."
    const user = includes.users.find(user => user.id == tweet.author_id)
    if (!user) throw "Could not find user in includes."
    return user
}


const canonicalTweetUrlPattern = /^https:\/\/twitter.com\/(?<username>\w+)\/status\/(?<tweetId>\w+)$/

export const TweetUrl = String.withConstraint(canonicalTweetUrlPattern.test, { name: 'TweetUrl' })
export type TweetUrl = Static<typeof TweetUrl>


export function parseCanonicalTweetUrl(tweetUrl: TweetUrl) {
    const match = canonicalTweetUrlPattern.exec(tweetUrl)
    if (!match?.groups) throw `Could not parse as canonical tweet URL: ${tweetUrl}`
    return {
        username: match.groups['username'] as string,
        tweetId: match.groups['tweetId'] as string,
    }
}

// Note: this will reconstruct the URL based on the username at the time of pulling the tweet data.
//  If the username changes, this URL will change too. Therefore, if you archived a tweet URL
//  under a different username, you won’t find it again with the new URL.
export function getCanonicalUrl(tweet: TweetV2, includes?: ApiV2Includes) {
    const username = getAuthor(tweet, includes).username
    const url = `https://twitter.com/${username}/status/${tweet.id}`
    console.assert(canonicalTweetUrlPattern.test(url))
    return url
}
