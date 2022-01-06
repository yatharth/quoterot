// Functions for posting to twitter: tweeting, replying, etc.

import {client} from './_auth'
import {verifyNoErrors} from './_errors'


export async function reply(toTweetId: string, message: string) {
    const result = await client.v2.reply(message, toTweetId)
    verifyNoErrors(result, "replying to a tweet")
    return result.data
}