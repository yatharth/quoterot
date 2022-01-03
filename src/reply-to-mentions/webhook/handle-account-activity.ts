import {forEach} from 'p-iteration'

import {jsonStringifyPretty} from '../../helpers/javascript/stringify'
import {fetchTweet} from '../../helpers/twitter/rest-api/tweet'
import {getQuotedTweet} from '../../helpers/twitter/rest-api/quote-tweets'
import {TweetCreateEvent, TweetCreateEvents} from './_account-activity-types'
import {readFromEnv} from '../../helpers/cdk/lambdas/secrets'
import {reply} from '../../helpers/twitter/rest-api/post'


const botUserId = readFromEnv('TWITTER_USERID')
const botUserName = readFromEnv('TWITTER_USERNAME')

async function replyWithHelpMessage(requestTweetId: string, reason: string) {
    const message = `${reason} I’m not sure what to do. To see how to use me, check the pinned tweet on my profile.`
    await reply(requestTweetId, message)
}

function debug(message: string, obj: unknown) {
    console.log(message)
    console.log(jsonStringifyPretty(obj))
}

async function handleEvent(event: TweetCreateEvent) {

    const requestTweetId = event.id_str

    if (event.user.id_str == botUserId) {
        debug("tweet was by us.", event)
        return
    }

    if (!event.full_text.includes("@" + botUserName)) {
        debug("not an explicit mention", event)
        return
    }

    // TODO: maybe check for inclusion of keyword?

    if (!event.in_reply_to_status_id_str) {
        debug("not in reply to something.", event)
        // TODO: uncomment
        await replyWithHelpMessage(requestTweetId, "Your tweet wasn’t in reply of anything.")
        return
    }

    const targetTweetId = event.in_reply_to_status_id_str
    const targetTweet = await fetchTweet(targetTweetId)

    const quotedTweet = getQuotedTweet(targetTweet)
    if (!quotedTweet) {
        debug("target tweet is not a quote tweet.", event)
        await replyWithHelpMessage(requestTweetId, "The tweet you replied to wasn’t a quote tweet.")
        return
    }

    // const archiveLink = getArchiveLink(quotedTweet)
    // if (!archiveLink) {
    //     debug("quoted tweet is not archived.", event)
    //     await reply(requestTweetId, "Could not find the quoted tweet in our archive. Sorry.")
    //     return
    // }
    //
    // await reply(requestTweetId, `Here’s an archive version of the quoted tweet: ${archiveLink}`)

}

export async function handleAccountActivity(body: any) {

    // This will throw an error if data cannot be parsed.
    const events = TweetCreateEvents.check(body)

    if (events.for_user_id !== botUserId) {
        debug("for_user_id was not us.", events)
        return
    }

    if (events.user_has_blocked) {
        debug("user_has_blocked was truthy.", events)
        return
    }

    if (!events.tweet_create_events) {
        debug("no tweet_create_events.", events)
        return
    }

    // This runs concurrently, and waits for all to finish.
    await forEach(events.tweet_create_events, handleEvent)

}