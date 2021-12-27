

// TODO: If the quoted user changes their username, our service will break.
//  Because it will try to look up the archived tweet under the new username,
//  which our archive service won’t have.
//
// There’s really no way around this, except to have a persistent store of
//  tweet id to username as archived with us. Thus, the move might be to create
//  an S3 bucket, and store key/value pairs there. Or actually, a DynamoDB table,
//  since that has a perpetual free tier, whereas S3 is only for 12mo, and structured
//  data might be better.


import {TweetV2} from 'twitter-api-v2'

export async function getArchiveLink(tweet: TweetV2) {
    return tweet.id + ""
}